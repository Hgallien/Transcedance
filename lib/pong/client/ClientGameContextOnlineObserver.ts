import { Socket } from "socket.io-client";
import { GameEvent } from "../common/constants";
import type { ErrorCallback, FinishCallback } from "../common/utils";
import { ClientGameContextOnline } from "./ClientGameContextOnline";

/**
 * Online version of the game in the client as an observer (see ClientGameContext)
 */
export class ClientGameContextOnlineObserver extends ClientGameContextOnline {
  ballOutAlreadyEmitted: boolean = false;

  constructor(socket: Socket, onFinish: FinishCallback, onError: ErrorCallback) {
    super(socket, onFinish, onError);

    this.listeners.add(socket, GameEvent.OBSERVER_UPDATE, (gameDataPlainObject: any, score: [number, number]) => {
      assignRecursively(
        this.gameManager.game.state.data.current,
        gameDataPlainObject
      );
      this.gameManager.renderer.scorePanels.score = score;
    });
    this.listeners.add(socket, GameEvent.PLAYER_DISCONNECT,
      (playerId: number) => this.errorExit(`The player ${playerId + 1} has disconnected`)
     );
    this.listeners.add(socket, GameEvent.EXIT_GAME,
      (playerId: number) => this.errorExit(`The player ${playerId + 1} has quited`)
     );
  }

  animate() {
    const animate = (time: DOMHighResTimeStamp) => {
      this.animationHandle = requestAnimationFrame(animate);
      this.gameManager.render(time);
    };
    animate(Date.now());
  }

  startGame() {}

  exitGame() {
    this.socket.emit(GameEvent.STOP_OBSERVING);
  }
}

function assignRecursively<T>(instance: T, plainObject: any) {
  for (let key in instance) {
    if (typeof instance[key] !== "object") {
      instance[key] = plainObject[key];
    } else {
      assignRecursively(instance[key], plainObject[key]);
    }
  }
}
