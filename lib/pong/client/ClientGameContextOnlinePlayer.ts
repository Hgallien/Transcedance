import { Socket } from "socket.io-client";
import { GameEvent, KeyValue } from "../common/constants";
import { ClientGameContextOnline } from "./ClientGameContextOnline";
import { setupKeyboardOnline } from "./game";
import { ChatEvent, type Id } from "backFrontCommon";
import type { ErrorCallback, FinishCallback } from "../common/utils";
import { keyActionOnline } from "./game/keyboardInput";

/**
 * Online version of the game in the client as a player (see ClientGameContext)
 */
export class ClientGameContextOnlinePlayer extends ClientGameContextOnline {
  // ballOutAlreadyEmitted: boolean = false;
  playerId?: number;

  constructor(socket: Socket, onFinish: FinishCallback, onError: ErrorCallback) {
    super(socket, onFinish, onError);

    // incomming events
    this.transmitEventFromServerToGame(GameEvent.START);
    this.transmitEventFromServerToGame(GameEvent.PAUSE);
    // this.listeners.add(this.socket, GameEvent.RESET, () => {
    //   this.ballOutAlreadyEmitted = false;
    // });
    this.transmitEventFromServerToGame(GameEvent.SPAWN_GRAVITON);
    this.transmitEventFromServerToGame(GameEvent.SPAWN_PORTAL);
    this.transmitEventFromServerToGame(GameEvent.RECEIVE_BAR_EVENT);
    this.transmitEventFromServerToGame(GameEvent.SET_BALL);
    this.listeners.add(this.socket, GameEvent.GOAL, (playerId: Id) => {
        this.gameManager.renderer.scorePanels.goalAgainst(playerId);
    })

    this.listeners.add(this.socket,
      ChatEvent.PLAYER_ID_CONFIRMED,
      (playerId: number, ready: () => void) => {
        setupKeyboardOnline(this, playerId, this.socket);
        this.registerWindowListener('blur', () => {
          keyActionOnline(this.gameManager.game.state, socket, playerId, KeyValue.UP, false);
          keyActionOnline(this.gameManager.game.state, socket, playerId, KeyValue.DOWN, false);
        })
        this.playerId = playerId;
        ready();
      }
    );

    this.listeners.add(this.socket, GameEvent.PLAYER_DISCONNECT, () => this.errorExit("the other player has disconnected"));
    this.listeners.add(this.socket, GameEvent.EXIT_GAME, () => this.errorExit("the other player has exited"));
  }

  animate() {
    // animation loop
    const animate = (time: DOMHighResTimeStamp) => {
      this.animationHandle = requestAnimationFrame(animate);
      this.gameManager.game.frame();
      this.gameManager.render(time);
    };
    animate(Date.now());
  }

  startGame() {}

  exitGame() {
    this.socket.emit(GameEvent.EXIT_GAME);
  }

  // private setupBallOutOutgoingEvent(playerId: number) {
  //   GameProducedEvent.registerEvent(
  //     GameEvent.BALL_OUT,
  //     (playerIdBallOut: number) => {
  //       if (playerIdBallOut == playerId && !this.ballOutAlreadyEmitted) {
  //         this.socket.emit(GameEvent.BALL_OUT, playerIdBallOut);
  //         this.ballOutAlreadyEmitted = true;
  //       }
  //     }
  //   );
  // }
}
