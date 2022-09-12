import { GSettings } from "../constants";
import { ElapsedTimeMeasurer } from "./ElapsedTimeMeasurer";

/**
 * Spawner is used by the context that spawns
 * gravitons and portals: ClientGameContextOffline
 * and ServerGameContext (resp. for offline and online version)
 * The purpose is to enable for both the ability to spawn using
 * the same rules
 */
export class Spawner {
  gravitonDelays: Iterator<number> = delaysGenerator(
    GSettings.GRAVITON_SPAWN_TMIN,
    GSettings.GRAVITON_SPAWN_TMAX
  );
  portalDelays: Iterator<number> = delaysGenerator(
    GSettings.PORTAL_SPAWN_TMIN,
    GSettings.PORTAL_SPAWN_TMAX
  );
  currentGravitonDelay: number = GSettings.GRAVITON_SPAWN_DELAY;
  currentPortalDelay: number = GSettings.PORTAL_SPAWN_DELAY;
  elapsedTimeMeasurer: ElapsedTimeMeasurer = new ElapsedTimeMeasurer();

  constructor(
    public spawnGraviton: () => void,
    public spawnPortal: () => void
  ) {
    this.reset();
  }

  start(startTime: number) {
    this.elapsedTimeMeasurer.start(startTime);
  }

  pause(pauseTime?: number) {
    this.elapsedTimeMeasurer.pause(pauseTime);
  }

  reset() {
    this.currentGravitonDelay = GSettings.GRAVITON_SPAWN_DELAY;
    this.currentPortalDelay = GSettings.PORTAL_SPAWN_DELAY;
    this.elapsedTimeMeasurer.reset();
  }

  frame() {
    const elapsed = this.elapsedTimeMeasurer.frame();
    this.currentGravitonDelay = consumeElapsedTime(
      elapsed,
      this.currentGravitonDelay,
      this.gravitonDelays,
      this.spawnGraviton
    );
    this.currentPortalDelay = consumeElapsedTime(
      elapsed,
      this.currentPortalDelay,
      this.portalDelays,
      this.spawnPortal
    );
  }
}

function consumeElapsedTime(
  elapsed: number,
  currentDelay: number,
  delaysGenerator: Iterator<number>,
  callback: Function
): number {
  currentDelay -= elapsed;
  while (currentDelay < 0) {
    callback();
    currentDelay += delaysGenerator.next().value;
  }
  return currentDelay;
}

function* delaysGenerator(tMin: number, tMax: number) {
  const DT = tMax - tMin;
  while (true) {
    yield Math.random() * DT + tMin;
  }
}
