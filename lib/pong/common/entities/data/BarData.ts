import { GSettings } from "../../constants";

/**
 * Structure for the bar's data
 * Grouped with the other entities in GameData
 */
export class BarData {
  x: number;
  y: number = 0;
  upPressed: boolean = false;
  downPressed: boolean = false;

  constructor(barId: number) {
    this.x = (barId == 0 ? -1 : 1) * GSettings.BAR_INITIALX;
  }

  get vy(): number {
    return (+this.downPressed - +this.upPressed) * GSettings.BAR_SENSITIVITY;
  }
  copyKeysState(bar: BarData) {
    this.downPressed = bar.downPressed;
    this.upPressed = bar.upPressed;
  }
}
