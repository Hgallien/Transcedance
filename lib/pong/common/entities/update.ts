/**
 * Utility functions for updating the GameDataBuffer (the game's state):
 *  - Apply Forces (cause: gravitons)
 *  - Apply Speed (cause: force)
 *  - Propagate data in the GameDataBuffer
 * Used in GameState's update method
 * Occur before the collisions (i.e. the "corrections/consequences" of those updates)
 */

import { GSettings } from "../constants";
import { Vector2 } from "../utils";
import { clipBallSpeedX, clipBallSpeedY } from "./collisions";
import { GameDataBuffer, GravitonData, type Spawnable } from "./data";

export function processExternEvents(data: GameDataBuffer) {
  if (data.eventsNow !== null) {
    for (let dataChanger of data.eventsNow) {
      dataChanger(data);
    }
  }
}

export function propagateBarInputs(data: GameDataBuffer) {
  data.next.bars[0].copyKeysState(data.current.bars[0]);
  data.next.bars[1].copyKeysState(data.current.bars[1]);
}

export function updateSpawnable(
  newEntityByCopy: (entity: Spawnable) => Spawnable,
  entitiesCurrent: Set<Spawnable>,
  entitiesNext: Set<Spawnable>,
  lifespan: number
) {
  entitiesNext.clear();
  entitiesCurrent.forEach((entity) => {
    if (entity.age < lifespan) {
      let entityNext = newEntityByCopy(entity);
      entityNext.age++;
      entitiesNext.add(entityNext);
    }
  });
}

export function applyForces(data: GameDataBuffer) {
  let resultForce = Array.from(data.current.gravitons.values())
    .map((graviton) => computeForce(data, graviton))
    .reduce(
      (totalForce, currentForce) => totalForce.add(currentForce),
      new Vector2()
    );
  data.next.ball.vx =
    data.current.ball.vx + GSettings.GAME_STEP_S * resultForce.x;
  data.next.ball.vy =
    data.current.ball.vy + GSettings.GAME_STEP_S * resultForce.y;
  clipBallSpeedX(data.next.ball);
  clipBallSpeedY(data.next.ball);
}

export function computeForce(
  data: GameDataBuffer,
  graviton: GravitonData
): Vector2 {
  let dx = Math.abs(data.current.ball.x - graviton.x);
  if (dx > GSettings.GRAVITON_FORCE_WIDTH_HALF) return new Vector2();
  let mx = Math.sqrt(1 - dx / GSettings.GRAVITON_FORCE_WIDTH_HALF);
  let d =
    (data.current.ball.y - graviton.y) / GSettings.GRAVITON_FORCE_HEIGHT_HALF;
  let dSign = Math.sign(d);
  let my = dSign / (1 + dSign * d);
  return new Vector2(0, -mx * my * GSettings.GRAVITON_MAX_FORCE);
}

export function applySpeed(data: GameDataBuffer) {
  data.next.ball.x =
    data.current.ball.x + GSettings.GAME_STEP_S * data.next.ball.vx;
  data.next.ball.y =
    data.current.ball.y + GSettings.GAME_STEP_S * data.next.ball.vy;
  data.next.bars[0].y =
    data.current.bars[0].y + GSettings.GAME_STEP_S * data.next.bars[0].vy;
  data.next.bars[1].y =
    data.current.bars[1].y + GSettings.GAME_STEP_S * data.next.bars[1].vy;
}
