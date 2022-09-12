import { Injectable, Logger } from '@nestjs/common';
import { removeIfPresent } from 'pong';
import { ServerGameContext } from 'pong';
import {
  ChatError,
  ChatEvent,
  Id,
  GameAcceptToServer,
  GameRefuseToServer,
  ChatFeedbackDto,
  RequestFeedbackDto,
  GameStyleFromServer,
} from 'backFrontCommon';
import { ServerSocket as Socket } from 'backFrontCommon';
import { GameInviteToServer } from 'backFrontCommon';
import { ActiveUser, UserService } from '../user/user.service';
import { GameCancelToServer } from 'backFrontCommon';
import { MatchHistoryService } from '../matchHistory/matchHistory.service';

/* eslint-disable */

type PendingGameInvite = {
  sourceSocket: Socket;
  sourceId: Id;
  target: ActiveUser;
  classic: boolean;
};

class ActiveGame {
  constructor(
    public players: [ActiveUser, ActiveUser],
    public ctx: ServerGameContext,
  ) {}

  get playersSocket(): [Socket, Socket] {
    return this.ctx.players;
  }
}

@Injectable()
export class GameManagerService {
  private matchQueueClassic: [Socket, ActiveUser][] = [];
  private matchQueueCustom: [Socket, ActiveUser][] = [];
  private pendingGameInvits: PendingGameInvite[] = [];
  // private games: ServerGameContext[] = [];
  private games: ActiveGame[] = [];
  private logger: Logger = new Logger('GameManagerService');

  constructor(
    private matchHistoryService: MatchHistoryService,
    private userService: UserService,
  ) {}

  addMatchmaking(socket: Socket, classic: boolean): ChatFeedbackDto {
    let matchQueue = classic ? this.matchQueueClassic : this.matchQueueCustom;
    if (
      matchQueue.find(([userSocket, user]) =>
        user.socketUser.includes(socket),
      ) !== undefined
    ) {
      return {
        success: false,
        errorMessage: ChatError.ALREADY_IN_MATCHMAKING,
      };
    }
    if (this.userService.findOneActiveBySocket(socket)?.inGame) {
      return {
        success: false,
        errorMessage: ChatError.YOU_ARE_ALREADY_IN_GAME,
      };
    }
    this.addSocketToMatchQueue(matchQueue, socket, classic);
    socket.on('disconnect', () => this.handleQuitMatchmaking(socket));
    return { success: true, errorMessage: undefined };
  }

  async handleObserve(
    socket: Socket,
    userId: Id,
  ): Promise<RequestFeedbackDto<GameStyleFromServer>> {
    const user = this.userService.findOneActive(userId);
    if (user === undefined) {
      return {
        success: false,
        errorMessage: ChatError.USER_OFFLINE,
      };
    }
    const game = this.games.find(
      (game) =>
        user.socketUser.includes(game.playersSocket[0]) ||
        user.socketUser.includes(game.playersSocket[1]),
    );
    user.socketUser.forEach((socket) => {
      console.log(`USER: ${socket.id}`);
    });
    this.games.forEach((game) => {
      console.log(`GAME: [${game.players[0].id}, ${game.players[1].id}]`);
    });
    if (game === undefined) {
      return {
        success: false,
        errorMessage: ChatError.USER_NOT_IN_GAME,
      };
    }
    game.ctx.addObserver(socket);
    return { success: true, result: { classic: game.ctx.classic } };
  }

  addSocketToMatchQueue(
    matchQueue: [Socket, ActiveUser][],
    socket: Socket,
    classic: boolean,
  ) {
    const activeUser = this.userService.findOneActiveBySocket(socket)!;
    matchQueue.push([socket, activeUser]);
    if (matchQueue.length >= 2) {
      this.startGame([matchQueue[0][0], matchQueue[1][0]], classic);
      matchQueue.splice(0, 2);
    }
  }

  async startGame(playerSockets: [Socket, Socket], classic: boolean) {
    if (Math.random() > 0.5)
      playerSockets = [playerSockets[1], playerSockets[0]];

    const onFinish = async (score1: number, score2: number) => {
      const players = await Promise.all(
        playerSockets.map((playerSocket) =>
          this.userService.findOneDbBySocket(playerSocket),
        ),
      );
      if (players[0] === null || players[1] === null) return;
      this.matchHistoryService.addOneMatch(
        [players[0]!, players[1]!],
        [score1, score2],
      );
      this.userService.scoreUpdate(
        [players[0]!, players[1]!],
        [score1, score2],
      );
    };

    const onFinally = () => {
      this.removeGame(activeGame);
    };

    const gameInstance: ServerGameContext = new ServerGameContext(
      playerSockets,
      classic,
      onFinish,
      onFinally,
    );
    const activeGame = new ActiveGame(
      this.activeUsersFromSockets(playerSockets),
      gameInstance,
    );
    this.games.push(activeGame);

    for (let i = 0; i < 2; i++) {
      const activeUser = this.userService.findOneActiveBySocket(
        playerSockets[i],
      );
      if (activeUser !== undefined) activeUser.inGame = true;
      playerSockets[i].emit(ChatEvent.GOTO_GAME_SCREEN, classic, () => {
        playerSockets[i].emit(ChatEvent.PLAYER_ID_CONFIRMED, i, () => {
          gameInstance.isReady(i);
        });
      });
    }
  }

  removeGame(activeGame: ActiveGame) {
    removeIfPresent(this.games, activeGame);
    activeGame.players.forEach((activeUser) => {
      activeUser.inGame = false;
    });
  }

  handleGameInvite(
    sourceSocket: Socket,
    dto: GameInviteToServer,
  ): ChatFeedbackDto {
    const source = this.userService.findOneActiveBySocket(sourceSocket)!;
    const target = this.userService.findOneActive(dto.target);
    if (target === undefined) {
      return {
        success: false,
        errorMessage: ChatError.USER_OFFLINE,
      };
    }
    if (target.id == source.id) {
      return {
        success: false,
        errorMessage: ChatError.CANNOT_INVITE_YOURSELF,
      };
    }
    if (target.inGame) {
      return {
        success: false,
        errorMessage: ChatError.USER_IN_GAME,
      };
    }
    const i = this.findIndexGameInviteFromSource(sourceSocket, dto.target);
    if (i != -1) {
      return {
        success: false,
        errorMessage: ChatError.USER_ALREADY_INVITED,
      };
    }
    this.addPendingGameInvite(sourceSocket, source.id, target, dto.classic);
    target.emitOnAllSockets(ChatEvent.GAME_INVITE, {
      source: source.id,
      classic: dto.classic,
    });

    return new ChatFeedbackDto(true);
  }

  private findIndexGameInviteFromSource(sourceSocket: Socket, targetId: Id) {
    return this.pendingGameInvits.findIndex(
      (invite: PendingGameInvite) =>
        invite.sourceSocket.id == sourceSocket.id &&
        invite.target.id == targetId,
    );
  }

  private findIndexGameInviteFromTarget(targetSocket: Socket, sourceId: Id) {
    const target = this.userService.findOneActiveBySocket(targetSocket)!;
    return this.pendingGameInvits.findIndex(
      (invite: PendingGameInvite) =>
        target.id == invite.target.id && sourceId == invite.sourceId,
    );
  }

  // GAME_ACCEPT
  handleGameAccept(
    targetSocket: Socket,
    dto: GameAcceptToServer,
  ): ChatFeedbackDto {
    const gameInvite = this.handleGameResponse(targetSocket, dto.target);
    if (gameInvite === undefined) {
      return {
        success: false,
        errorMessage: ChatError.NO_SUCH_GAME_INVITATION,
      };
    }
    if (this.userService.findOneActive(dto.target)?.inGame) {
      return {
        success: false,
        errorMessage: ChatError.USER_IN_GAME,
      };
    }
    gameInvite.sourceSocket.emit(ChatEvent.GAME_ACCEPT, {
      source: gameInvite.target.id,
    });
    this.startGame([gameInvite.sourceSocket, targetSocket], gameInvite.classic);
    return new ChatFeedbackDto(true);
  }

  // GAME_REFUSE
  handleGameRefuse(targetSocket: Socket, dto: GameRefuseToServer) {
    const gameInvite = this.handleGameResponse(targetSocket, dto.target);
    if (gameInvite === undefined) return;
    gameInvite.sourceSocket.emit(ChatEvent.GAME_REFUSE, {
      source: gameInvite.target.id,
      reason: dto?.reason,
    });
  }

  // GAME_CANCEL
  handleGameCancel(sourceSocket: Socket, dto: GameCancelToServer) {
    const i = this.findIndexGameInviteFromSource(sourceSocket, dto.target);
    if (i == -1) return;
    const gameInvite = this.pendingGameInvits[i];
    this.pendingGameInvits.splice(i, 1);
    gameInvite.target.emitOnAllSockets(ChatEvent.GAME_CANCEL, {
      source: gameInvite.sourceId,
      reason: dto?.reason,
    });
  }

  private handleGameResponse(
    targetSocket: Socket,
    sourceId: Id,
  ): PendingGameInvite | undefined {
    const _target = this.userService.findOneActiveBySocket(targetSocket)!;
    const _source = this.userService.findOneActive(sourceId);

    const target = this.userService.findOneActiveBySocket(targetSocket)!;
    const gameInvite = this.findAndRemovePendingGameInvite(sourceId, target.id);
    if (!gameInvite) {
      // Somebody accepted w/o having been invited
      return undefined;
    }
    // DELETE ALL FROM SOURCE TO TARGET's OTHER SOCKETAS
    target.socketUser
      .filter((_) => _ != targetSocket)
      .forEach((socket) =>
        socket.emit(ChatEvent.DELETE_GAME_INVITE, { target: sourceId }),
      );
    return gameInvite;
  }

  handleQuitMatchmaking(socket: Socket) {
    this.matchQueueClassic = this.matchQueueClassic.filter(
      ([s, _]) => s != socket,
    );
    this.matchQueueCustom = this.matchQueueCustom.filter(
      ([s, _]) => s != socket,
    );
  }

  // Utils

  private addPendingGameInvite(
    sourceSocket: Socket,
    sourceId: Id,
    target: ActiveUser,
    classic: boolean,
  ) {
    sourceSocket.on('disconnect', () => {
      target.emitOnAllSockets(ChatEvent.GAME_CANCEL, {
        source: sourceId,
        reason: ChatError.USER_OFFLINE,
      });
      this.removeBySourceId(sourceId);
    });
    target.eventEmitter.on('disconnect', () => {
      sourceSocket.emit(ChatEvent.GAME_REFUSE, {
        source: target.id,
        reason: ChatError.USER_OFFLINE,
      });
      this.removeByTargetId(target.id);
    });
    this.pendingGameInvits.push({
      sourceSocket,
      sourceId,
      target,
      classic,
    });
  }

  private findAndRemovePendingGameInvite(
    sourceId: Id,
    targetId: Id,
  ): PendingGameInvite | undefined {
    const i = this.pendingGameInvits.findIndex(
      (gameInvite: PendingGameInvite) => {
        // console.log(`${gameInvite.sourceId} == ${sourceId} && ${gameInvite.target.id} == ${targetId}`);
        return (
          gameInvite.sourceId == sourceId && gameInvite.target.id == targetId
        );
      },
    );
    if (i == -1) return undefined;
    const gameInvite = this.pendingGameInvits[i];
    this.pendingGameInvits.splice(i, 1);
    return gameInvite;
  }

  private removeBySourceId(id: Id) {
    this.pendingGameInvits = this.pendingGameInvits.filter(
      (invite) => invite.sourceId != id,
    );
  }

  private removeByTargetId(id: Id) {
    this.pendingGameInvits = this.pendingGameInvits.filter(
      (invite) => invite.target.id != id,
    );
  }

  private activeUsersFromSockets(
    sockets: [Socket, Socket],
  ): [ActiveUser, ActiveUser] {
    return sockets.map(
      (socket) => this.userService.findOneActiveBySocket(socket)!,
    ) as [ActiveUser, ActiveUser];
  }

  // DEBUG
  private _invitsToString() {
    return (
      '[' +
      this.pendingGameInvits
        .map(
          (invite) =>
            `{source: ${invite.sourceId}, target: ${invite.target.id}}`,
        )
        .join(', ') +
      ']'
    );
  }
  private _gamesToString(): string {
    let games = this.games.map((game) => {
      let players = game.players.map((user) => `${user?.name}`);
      return `P1: ${players[0]} vs P2: ${players[1]}`;
    });
    return games.join('\n');
  }
  //
}
