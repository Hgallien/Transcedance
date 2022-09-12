import { GameEvent } from "../common/constants";
import { GameProducedEvent } from "../common/game/events";
import type { FinishCallback, ErrorCallback} from "../common/utils";
import { ClientGameManager } from "./game";

/**
 * Root of the client code execution
 *
 * Online version as player (ClientGameContextOnlinePlayer):
 *  - Connect to the server's socket namespace upon creation,
 *    currently joining the matchmaking system
 *  - Wait for server to confirm a game starts
 *  - Only then can know its role (p1, p2)
 *  - Receive the Game events from the server
 *
 * Online version as observer (ClientGameContextOnlineObserver):
 *  - Connect to the server's socket namespace upon creation,
 *    currently joining the first game of the current playing games
 *  - Receive a strem of the current state of the game from the server
 *
 * Offline version (ClientGameContextOffline):
 *  - Start immediately
 *  - Spawn the gravitons and protals
 */
export abstract class ClientGameContext {
  gameManager: ClientGameManager = new ClientGameManager();
  animationHandle?: number;
  windowListeners: Map<Parameters<typeof addEventListener>[0], Parameters<typeof addEventListener>[1]> = new Map();

  constructor(public onFinish: FinishCallback, public onError?: ErrorCallback) {
  }

  abstract animate(): void;
  abstract startGame(): void;

  protected handleEndOfGame(score?: [number, number]) {
    score = score ?? this.gameManager.game.score;
    this.clean();
    this.onFinish(...score);
  }

  public registerWindowListener(...args: Parameters<typeof addEventListener>) {
    window.addEventListener(...args);
    this.windowListeners.set(args[0], args[1]);
  }

  protected clean() {
    if (this.animationHandle !== undefined)
      cancelAnimationFrame(this.animationHandle);
    GameProducedEvent.removeAll();
    this.windowListeners.forEach((listener, key) => {
      window.removeEventListener(key, listener);
    })
  }

  // called when the client leaves the page
  abstract exitGame(): void;
}

// type GlobalListener<Key extends keyof GlobalEventHandlersEventMap> = (this: Window, ev: WindowEventMap[Key]) => any;
// type Listeners<Key extends keyof GlobalEventHandlersEventMap> = Map<Key, GlobalListener<Key>>;
