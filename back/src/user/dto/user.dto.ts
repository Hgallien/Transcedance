import { Id } from 'backFrontCommon';
import { Socket as IOSocketBaseType } from 'socket.io';

import { ServerToClientEvents, ClientToServerEvents } from 'backFrontCommon';

type Socket = IOSocketBaseType<ClientToServerEvents, ServerToClientEvents>;

export class UserDto {
  constructor(public id: Id, public name: string, public socket: Socket) {}
}
