import { GSettings } from "../../common/constants";
import { Game } from "../../common/game";
import { Renderer } from "../graphic";

/**
 * Holds the Game instance on the client's side.
 * It adds to Game the rendering capability, the handling
 * of the client's keyboard inputs.
 * It is extended in an online and an offline version
 */
export class ClientGameManager {
  game: Game;
  container: HTMLDivElement;
  renderer: Renderer;

  constructor() {
    this.game = new Game();

    // HTML
    this.container = document.getElementById(
      "game-container"
    ) as HTMLDivElement;
    this.renderer = new Renderer(this.game.state.data);

    // scene
    this.handleDisplayResize();

    // callbacks
    window.addEventListener("resize", () => this.handleDisplayResize());
  }

  handleDisplayResize() {
    let width: number, height: number;
    let availableWidth = this.container.offsetWidth;
    let availableHeight = this.container.offsetHeight;
    if (availableWidth / availableHeight < GSettings.SCREEN_RATIO) {
      width = availableWidth;
      height = availableWidth / GSettings.SCREEN_RATIO;
    } else {
      width = GSettings.SCREEN_RATIO * availableHeight;
      height = availableHeight;
    }
    this.renderer.handleResize(width, height);
  }

  render(time: number) {
    this.renderer.render(time);
  }
}
