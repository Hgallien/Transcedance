import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginEvent } from 'backFrontCommon';
import { UserDto } from '../user/dto/user.dto';
import { TOTP, Secret } from 'otpauth';
import { Socket as IOSocketBaseType } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from 'backFrontCommon';
import fetch from 'node-fetch';
import { isNumber, isString } from 'class-validator';
type Socket = IOSocketBaseType<ClientToServerEvents, ServerToClientEvents>;

const AUTH_URL = 'https://api.intra.42.fr/oauth/authorize';

@Injectable()
export class LoginService {
  readonly authUrl: string;
  private readonly redirectURI: string;

  private readonly logger = new Logger('LoginService');
  private clientsRequiringTotp = new Map<
    Socket,
    { totp: TOTP; user: UserDto }
  >();

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const appId = configService.getOrThrow<string>('PUBLIC_APP_42_ID');
    const serverAddress = configService.getOrThrow<string>(
      'PUBLIC_SERVER_ADDRESS',
    );
    const serverPagePort = configService.getOrThrow<string>(
      'PUBLIC_SERVER_PAGE_PORT',
    );
    this.redirectURI = `http://${serverAddress}:${serverPagePort}`;

    const encodedURI = encodeURIComponent(this.redirectURI);

    this.authUrl = `${AUTH_URL}?client_id=${appId}&redirect_uri=${encodedURI}&response_type=code`;
  }

  async fetchToken(code: string): Promise<string> {
    const body = JSON.stringify({
      grant_type: 'authorization_code',
      client_id: this.configService.getOrThrow<string>('PUBLIC_APP_42_ID'),
      client_secret: this.configService.getOrThrow<string>('APP_42_SECRET'),
      code,
      redirect_uri: this.redirectURI,
    });
    const response = await fetch(`https://api.intra.42.fr/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!response.ok)
      throw new Error(`Could not fetch token: ${response.statusText}`);
    const data = await response.json();
    if (typeof data !== 'object') {
      throw new Error('Invalid body type');
    }
    const { access_token } = data;
    if (!isString(access_token)) {
      throw new Error('Could not extract token');
    }
    return access_token;
  }

  async fetchUserInfo(token: string): Promise<{ id: number; login: string }> {
    const response = await fetch('https://api.intra.42.fr/v2/me/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
      throw new Error(`Could not fetch user id: ${response.statusText}`);

    const data = await response.json();
    if (!(typeof data == 'object')) throw new Error('Invalid body type');

    const { id, login } = data;
    if (!(isNumber(id) && isString(login)))
      throw new Error(`Could not fetch id or login properly`);

    return { id, login };
  }

  async handleGuest(socket: Socket) {
    await this.userService.addOneGuest(socket);
    socket.emit(LoginEvent.SUCCESS);
  }

  async onTotpUpdate(socket: Socket, secret: string | null) {
    const user = this.userService.findOneActiveBySocket(socket);
    await this.userService.updateTotp(user!.id, secret);
  }

  async onTotpCheck(socket: Socket, token: string) {
    const client = this.clientsRequiringTotp.get(socket)!;

    const delta = client.totp.validate({ token });
    const success = delta === 0;

    if (success) {
      await this.userService.addOne(client.user);
      this.clientsRequiringTotp.delete(socket);
      socket.emit(LoginEvent.SUCCESS);
    } else {
      socket.emit(LoginEvent.FAILURE);
    }
  }

  async handleUser(socket: Socket, code: string) {
    let token: string;
    try {
      token = await this.fetchToken(code);
    } catch (e: any) {
      this.logger.log((e as Error).message);
      return;
    }

    const { id, login } = await this.fetchUserInfo(token);
    const user = new UserDto(id, login, socket);

    const userInDb = await this.userService.findOneDb(id);
    const totpSecret = userInDb?.totpSecret;

    if (!totpSecret) {
      await this.userService.addOne(user);
      socket.emit(LoginEvent.SUCCESS);
    } else {
      const totp = new TOTP({
        secret: Secret.fromHex(totpSecret),
      });
      this.clientsRequiringTotp.set(socket, { totp, user });
      socket.emit(LoginEvent.TOTP_REQUIRED, (token) =>
        this.onTotpCheck(socket, token),
      );
    }
  }

  async handleConnection(socket: Socket) {
    const code = socket.handshake.auth.code;

    if (isString(code)) {
      await this.handleUser(socket, code);
    } else {
      await this.handleGuest(socket);
    }
  }

  handleDisconnect(socket: Socket) {
    if (this.clientsRequiringTotp.has(socket)) {
      this.clientsRequiringTotp.delete(socket);
      socket.disconnect();
      return;
    }
    this.userService.disconnection(socket);
  }
}
