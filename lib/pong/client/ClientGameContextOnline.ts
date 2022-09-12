import { Socket } from "socket.io-client";
import { GameEvent } from "../common/constants";
import { Listeners, type ErrorCallback, type FinishCallback } from "../common/utils";
import { ClientGameContext } from "./ClientGameContext";

/**
 * Utility class to store common behavior between
 * ClientGameContextOnlinePlayer and ClientGameContextOnlineObserver
 */
export abstract class ClientGameContextOnline extends ClientGameContext {
  listeners: Listeners<Socket> = new Listeners();

  constructor(public socket: Socket, onFinish: FinishCallback, onError: ErrorCallback) {
    super(onFinish, onError);

    this.transmitEventFromServerToGame(GameEvent.RESET);
    this.listeners.add(this.socket, GameEvent.RESET, () => {
      this.gameManager.renderer.victoryAnimation = undefined;
    })
    this.transmitEventFromServerToGame(GameEvent.GOAL);
    this.listeners.add(this.socket, GameEvent.GOAL, () => {
      this.gameManager.game.pause();
      this.gameManager.renderer.startVictoryAnimationAsync();
    });
    this.listeners.add(this.socket, GameEvent.GAME_OVER, (score: [number, number]) => {
      this.handleEndOfGame(score);
    })
  }

  protected transmitEventFromServerToGame(event: string) {
    this.listeners.add(this.socket, event, (...args: any[]) => {
      this.gameManager.game.emit(event, ...args);
      console.log(`From server: ${event}: ${args}`);
    });
  }

  protected errorExit(errorMessage: string) {
    this.gameManager.game.pause();
    this.clean();
    this.onError!(errorMessage);
  }

  protected clean(): void {
    this.listeners.removeAll();
    super.clean();
  }
}
