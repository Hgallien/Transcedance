import { BallData, BarData, GravitonData, PortalData } from ".";

/**
 * Group of all the game entities at one instant
 */
export class GameData {
  ball: BallData = new BallData();
  bars: [BarData, BarData] = [new BarData(0), new BarData(1)];
  gravitons: Set<GravitonData> = new Set();
  portals: Set<PortalData> = new Set();

  reset() {
    this.ball = new BallData();
    this.bars = [new BarData(0), new BarData(1)];
    this.gravitons.clear();
    this.portals.clear();
  }
}
