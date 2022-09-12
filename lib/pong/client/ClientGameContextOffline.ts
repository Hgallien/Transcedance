import { GameEvent, GSettings, KeyValue } from "../common/constants";
import {
  GameProducedEvent,
} from "../common/game/events";
import { Spawner } from "../common/game/Spawner";
import {
  delay,
  randomGravitonCoords,
  randomPortalCoords,
} from "../common/utils";
import type { FinishCallback } from '../common/utils';
import { ClientGameContext } from "./ClientGameContext";
import { setupKeyboardOffline } from "./game";
import { keyAction } from "./game/keyboardInput";

/**
 * Offline version of the game in the client (see ClientGameContext)
 */
export class ClientGameContextOffline extends ClientGameContext {
  spawner?: Spawner;

  constructor(onFinish: FinishCallback, classic: boolean) {
    super(onFinish);
    if (!classic) {
      this.spawner = new Spawner(
        this.spawnGraviton.bind(this),
        this.spawnPortal.bind(this)
      );
    }
    this.reset(GSettings.BALL_INITIAL_SPEEDX);

    // input events
    setupKeyboardOffline(this);
    this.registerWindowListener('blur', () => {
      keyAction(this.gameManager.game.state, 0, KeyValue.UP, false);
      keyAction(this.gameManager.game.state, 0, KeyValue.DOWN, false);
      keyAction(this.gameManager.game.state, 1, KeyValue.UP, false);
      keyAction(this.gameManager.game.state, 1, KeyValue.DOWN, false);
    })

    // internal events
    GameProducedEvent.registerEvent(GameEvent.BALL_OUT, (playerId: number) => {
      this.gameManager.game.emit(GameEvent.GOAL, playerId);
      this.handleGoal(playerId);
    });
  }

  animate() {
    // animation loop
    let animate = (time: DOMHighResTimeStamp) => {
      this.animationHandle = requestAnimationFrame(animate);
      this.gameManager.game.frame();
      this.spawner?.frame();
      this.gameManager.render(time);
    };
    animate(Date.now());
  }

  startGame() {
    const now = Date.now();
    this.gameManager.game.start(now);
    this.spawner?.start(now);
  }

  reset(ballSpeedX: number) {
    this.gameManager.game.reset(0, 0, ballSpeedX, 0);
    this.spawner?.reset();
  }

  spawnGraviton() {
    const game = this.gameManager.game;
    const [x, y] = randomGravitonCoords();
    game.emit(GameEvent.SPAWN_GRAVITON, game.state.data.actualNow, x, y);
  }

  spawnPortal() {
    const game = this.gameManager.game;
    const [x1, x2, y1, y2] = randomPortalCoords();
    game.emit(
      GameEvent.SPAWN_PORTAL,
      game.state.data.actualNow,
      x1,
      y1,
      x2,
      y2
    );
  }

  handleGoal(playerId: number) {
    const game = this.gameManager.game;
    const renderer = this.gameManager.renderer;
    game.pause();
    renderer.startVictoryAnimationAsync().then(() => {
      const ballSpeedX =
        (playerId == 0 ? -1 : 1) * GSettings.BALL_INITIAL_SPEEDX;
      this.reset(ballSpeedX);
      renderer.scorePanels.goalAgainst(playerId);
      if (this.gameManager.game.isOver()) {
        this.handleEndOfGame();
      } else {
        delay(500).then(() => this.startGame());
      }
    });
  }

  exitGame() {
    this.clean();
  }
}
