import {
  PLAYER1,
  PLAYER2,
  GameEvent,
  LEFT,
  RIGHT,
  Direction,
  GSettings,
} from "../common/constants";
import { Socket } from "socket.io";
import { BarInputEvent, Game } from "../common/game";
import { type BarInputEventStruct } from "../common/game/events";
import { Spawner } from "../common/game/Spawner";
import {
  delay,
  Listeners,
  randomGravitonCoords,
  randomPortalCoords,
  removeIfPresent,
  type FinallyCallback,
  type FinishCallback,
} from "../common/utils";

/**
 * Manage a full game session between two players (sockets) in the server
 * Centralize event management by broadcast and transmission
 * Instanciated in the backend whenever a game should start
 */
export class ServerGameContext {
  game: Game;
  ready: [boolean, boolean] = [false, false];
  ballDirection: number = LEFT;
  spawner?: Spawner;
  observers: Socket[] = [];
  gameLoopHandle?: ReturnType<typeof setInterval>;
  ballOutAlreadyConsumed: boolean = false;
  gameAlreadyStarted: boolean = true;
  listeners: Listeners<Socket> = new Listeners();

  constructor(public players: [Socket, Socket], public classic: boolean, public onFinish: FinishCallback, public onFinally: FinallyCallback) {
    this.game = new Game();
    for (let [emitter, receiver] of [
      [PLAYER1, PLAYER2],
      [PLAYER2, PLAYER1],
    ]) {
      this.listeners.add(this.players[emitter], GameEvent.SEND_BAR_EVENT, (...args: BarInputEventStruct) => {
        this.players[receiver].emit(GameEvent.RECEIVE_BAR_EVENT, ...args);
        this.game.state.registerEvent(new BarInputEvent(...args));
      });
      this.listeners.add(this.players[emitter], GameEvent.READY, () => this.isReady(emitter));
      this.listeners.add(this.players[emitter], "disconnect", () => this.handlePlayerDisconnect(emitter));
      this.listeners.add(this.players[emitter], GameEvent.EXIT_GAME, () => this.handleExitGame(emitter));
      // this.players[emitter].on(
      //   GameEvent.SEND_BAR_EVENT,
      //   (...args: BarInputEventStruct) => {
      //     this.players[receiver].emit(GameEvent.RECEIVE_BAR_EVENT, ...args);
      //     this.game.state.registerEvent(new BarInputEvent(...args));
      //   }
      // );
      // this.players[emitter].on(GameEvent.READY, () => this.isReady(emitter));
      // this.players[emitter].on("disconnect", () => this.handlePlayerDisconnect(emitter));
      // this.players[emitter].on(GameEvent.EXIT_GAME, () => this.handleExitGame(emitter));
    }

    if (!classic) {
      this.spawner = new Spawner(
        this.spawnGraviton.bind(this),
        this.spawnPortal.bind(this)
      );
    }

    const data = this.game.state.data;
    let cpt = 0;
    this.gameLoopHandle = setInterval(() => {
      this.game.frame();
      this.spawner?.frame();
      for (let observer of this.observers) {
        observer.emit(GameEvent.OBSERVER_UPDATE, this.game.state.data.current, this.game.score);
      }
      this.checkBallOut();
      if (this.gameAlreadyStarted) {
        if (cpt % 2 == 0) {
          for (let i = 0; i < 2; i++) {
            players[i].emit(
              GameEvent.SET_BALL,
              data.actualNow,
              data.current.ball.x,
              data.current.ball.y,
              data.current.ball.vx,
              data.current.ball.vy
              );
          }
        }
        cpt++;
      }
    }, GSettings.GAME_STEP_MS);
  }

  finally() {
    this.listeners.removeAll();
    this.onFinally();
  }

  isReady(playerId: number) {
    this.ready[playerId] = true;
    if (this.ready[0] && this.ready[1]) {
      console.log("both players are ready, starting");
      this.launch(LEFT);
      this.gameAlreadyStarted = true;
    }
  }

  launch(ballDirection: Direction) {
    this.reset(0, 0, ballDirection);
    this.start(500);
  }

  addObserver(socket: Socket) {
    this.observers.push(socket);
    socket.on("disconnect", () => {
      removeIfPresent(this.observers, socket);
    });
    socket.on(GameEvent.STOP_OBSERVING, () => {
      removeIfPresent(this.observers, socket);
    });
  }

  broadcastEventPlayersOnly(event: string, ...args: any[]) {
    this.game.emit(event, ...args);
    this.players[PLAYER1].emit(event, ...args);
    this.players[PLAYER2].emit(event, ...args);
  }

  broadcastEventEveryone(event: string, ...args: any[]) {
    this.game.emit(event, ...args);
    this.players[PLAYER1].emit(event, ...args);
    this.players[PLAYER2].emit(event, ...args);
    for (let observer of this.observers) {
      observer.emit(event, ...args);
    }
  }

  start(delay: number) {
    const startTime = Date.now() + delay;
    this.broadcastEventPlayersOnly(GameEvent.START, startTime);
    this.spawner?.start(startTime);
  }

  pause(delay: number) {
    const pauseTime = Date.now() + delay;
    this.broadcastEventPlayersOnly(GameEvent.PAUSE, pauseTime);
    this.spawner?.pause(pauseTime);
  }

  reset(ballX: number, ballY: number, ballDirection: Direction) {
    let ballSpeedX = ballDirection * GSettings.BALL_INITIAL_SPEEDX;
    let ballSpeedY = ((2 * Math.random() - 1) * GSettings.BALL_SPEEDY_MAX) / 3;
    this.broadcastEventEveryone(
      GameEvent.RESET,
      ballX,
      ballY,
      ballSpeedX,
      ballSpeedY
    );
    this.spawner?.reset();
    this.ballOutAlreadyConsumed = false;
  }

  spawnGraviton() {
    const time = this.game.state.data.actualNow + GSettings.ONLINE_SPAWN_DELAY;
    const [x, y] = randomGravitonCoords();
    this.broadcastEventPlayersOnly(GameEvent.SPAWN_GRAVITON, time, x, y);
  }

  spawnPortal() {
    const time = this.game.state.data.actualNow + GSettings.ONLINE_SPAWN_DELAY;
    const [x1, x2, y1, y2] = randomPortalCoords();
    this.broadcastEventPlayersOnly(
      GameEvent.SPAWN_PORTAL,
      time,
      x1,
      y1,
      x2,
      y2
    );
  }

  checkBallOut() {
    if (!this.gameAlreadyStarted || this.ballOutAlreadyConsumed)
      return;
    const ball = this.game.state.data.current.ball;
    if (ball.x < GSettings.GAME_LEFT - GSettings.BALL_RADIUS) {
      this.ballOutAlreadyConsumed = true;
      this.handleGoal(0);
    }
    else if (ball.x > GSettings.GAME_RIGHT + GSettings.BALL_RADIUS) {
      this.ballOutAlreadyConsumed = true;
      this.handleGoal(1);
    }
  }

  handleGoal(playerId: number) {
    console.log("GOAL !!!");
    this.game.pause();
    this.spawner?.pause();
    this.broadcastEventEveryone(GameEvent.GOAL, playerId);
    if (this.game.isOver()) {
      this.handleEndOfGame();
    }
    else {
      const ballDirection = playerId == PLAYER1 ? LEFT : RIGHT;
      delay(1000).then(() => this.launch(ballDirection));
    }
  }

  handleEndOfGame() {
    const score = this.game.score;
    this.players[0].emit(GameEvent.GAME_OVER, score);
    this.players[1].emit(GameEvent.GAME_OVER, score);
    for (let observer of this.observers) {
      observer.emit(GameEvent.GAME_OVER, score);
    }
    clearInterval(this.gameLoopHandle);
    this.finally();
    this.onFinish(score[0], score[1]);
  }

  handleGameTermination(event: string, playerId: number) {
    this.players[1 - playerId].emit(event, playerId);
    for (let observer of this.observers) {
      observer.emit(event, playerId);
    }
    clearInterval(this.gameLoopHandle);
    this.finally();
  }

  handlePlayerDisconnect(playerId: number) {
    this.handleGameTermination(GameEvent.PLAYER_DISCONNECT, playerId);
  }

  handleExitGame(playerId: number) {
    this.handleGameTermination(GameEvent.EXIT_GAME, playerId);
  }
}
