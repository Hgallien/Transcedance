import { BallData } from ".";
import { GSettings } from "../../constants";
import { type Spawnable } from ".";

/**
 * Structure for a portal's data
 * Grouped with the other entities in GameData
 */
export class PortalData implements Spawnable {
  parts: [PortalHalfData, PortalHalfData] = [new PortalHalfData(), new PortalHalfData()];
  transportX: number = 0;
  transportY: number = 0;
  age: number = 0;

  // constructor(x1: number, y1: number, x2: number, y2: number) {
  setPosition(x1: number, y1: number, x2: number, y2: number) {
    this.parts[0].setPosition(x1, y1);
    this.parts[1].setPosition(x2, y2);
    this.transportX = x2 - x1;
    this.transportY = y2 - y1;
  }
}

/**
 * Data for one of the two parts of a portal
 */
export class PortalHalfData {
  yTop: number = 0;
  yBottom: number = 0;
  x: number = 0;
  y: number = 0;

  // constructor(public x: number, public y: number) {
  constructor() {}

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.yTop = y - GSettings.PORTAL_HEIGHT / 2;
    this.yBottom = y + GSettings.PORTAL_HEIGHT / 2;
  }

  ballIsLeft(ball: BallData) {
    return ball.x <= this.x && ball.y >= this.yTop && ball.y <= this.yBottom;
  }
  ballIsRight(ball: BallData) {
    return ball.x > this.x && ball.y >= this.yTop && ball.y <= this.yBottom;
  }
}
