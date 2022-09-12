/**
 * Records a series of start/pause commands, to compute
 * the effective running time between the current instant and
 * the last one
 */
export class ElapsedTimeMeasurer {
  startTime: number = 0;
  pauseTime: number = 0;
  lastNow: number = 0;
  paused: boolean = true;

  reset() {
    this.pause();
    this.lastNow = this.pauseTime;
  }

  start(startTime: number) {
    this.paused = false;
    this.startTime = startTime;
  }

  pause(pauseTime?: number) {
    this.paused = true;
    if (pauseTime !== undefined) this.pauseTime = pauseTime;
  }

  frame(): number {
    const now = Date.now();
    let accumulated: number;

    if (this.paused) {
      if (now < this.pauseTime) {
        accumulated = now - this.lastNow;
      } else if (this.lastNow < this.pauseTime) {
        accumulated = this.pauseTime - this.lastNow;
      } else {
        accumulated = 0;
      }
    } else {
      if (now < this.startTime) {
        accumulated = 0;
      } else if (this.lastNow < this.startTime) {
        accumulated = now - this.startTime;
      } else {
        accumulated = now - this.lastNow;
      }
    }
    this.lastNow = now;
    return accumulated;
  }
}
