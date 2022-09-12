import { GSettings } from "../../common/constants";
import { Renderer } from "./Renderer";

/**
 * An animation produces timed modifications to the canvas
 * and is chained with a given callback when finished
 * Extended by VictoryAnimation
 */
export abstract class Animation {
  firstTime!: number;
  lastTime!: number;
  frameCalled: boolean = false;
  ended: boolean = false;

  constructor(
    public renderer: Renderer,
    public duration: number,
    public thenCallback: () => any
  ) {}

  frame(time: number) {
    if (time - this.firstTime > this.duration) {
      if (!this.ended) this.thenCallback();
      this.ended = true;
      return;
    }
    let elapsed;
    if (!this.frameCalled) {
      this.firstTime = time;
      this.frameCalled = true;
      elapsed = 0;
    } else elapsed = time - this.lastTime;
    this.lastTime = time;
    this.draw(elapsed);
  }

  abstract draw(elapsed: number): void;
}

/**
 * Animation used to illustrate a goal has been scored
 * Used in Renderer
 */
export class VictoryAnimation extends Animation {
  previousRadius: number;
  constructor(renderer: Renderer, thenCallback: () => any) {
    super(renderer, GSettings.VICTORY_ANIMATION_DURATION_MS, thenCallback);
    this.previousRadius = renderer.ballRadius;
  }
  draw(elapsed: number) {
    let nextRadius =
      elapsed * GSettings.VICTORY_ANIMATION_SPEED + this.previousRadius;
    let [x, y] = this.renderer.gameToCanvasCoord(
      this.renderer.data.current.ball.x,
      this.renderer.data.current.ball.y
    );
    this.renderer.context.fillStyle = GSettings.VICTORY_ANIMATION_COLOR;
    this.renderer.context.beginPath();
    this.renderer.context.ellipse(
      x,
      y,
      nextRadius,
      nextRadius,
      0,
      0,
      2 * Math.PI
    );
    this.renderer.context.fill();
    this.renderer.drawBall(this.renderer.data.current.ball);
    this.previousRadius = nextRadius;
  }
}
