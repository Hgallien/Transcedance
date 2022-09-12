import { GSettings } from "../constants";
import { GameProducedEvent } from "../game/events";
import type { DataChangerEvent } from "../game/events";
import { collisions } from "./collisions";
import { GameDataBuffer, GravitonData, type Spawnable } from "./data";
import {
  applyForces,
  applySpeed,
  processExternEvents,
  propagateBarInputs,
  updateSpawnable,
} from "./update";

/**
 * GameState is the main class in the hierarchy for the
 * game's entities
 * It is responsible for updating itself and handling external events
 * The data is bufferized (see GameDataBuffer)
 * The sole purpose the buffer is to allow both
 * determination and synchronisation in online version
 * In case of a misunderstanding between server and client,
 * the past data can be restored and we can recompute what happened since
 */
export class GameState {
  data: GameDataBuffer = new GameDataBuffer();
  eventBuffer: DataChangerEvent[] = [];

  reset(ballX: number, ballY: number, ballSpeedX: number, ballSpeedY: number) {
    this.data.reset();
    this.data.current.ball.x = ballX;
    this.data.current.ball.y = ballY;
    this.data.current.ball.vx = ballSpeedX;
    this.data.current.ball.vy = ballSpeedY;
  }

  update() {
    this.computeOneStep();
    this.data.actualNow++;
    GameProducedEvent.fireAllEvents();
  }

  computeOneStep() {
    for (let event of this.eventBuffer) {
      this.handleEvent(event);
    }
    this.eventBuffer = [];
    processExternEvents(this.data);
    propagateBarInputs(this.data);
    updateSpawnable(
      this.data.newGravitonByCopy.bind(this.data) as unknown as (entity: Spawnable) => Spawnable,
      this.data.current.gravitons,
      this.data.next.gravitons,
      GSettings.GRAVITON_LIFESPAN
    );
    updateSpawnable(
      this.data.newPortalByCopy.bind(this.data) as unknown as (entity: Spawnable) => Spawnable,
      this.data.current.portals,
      this.data.next.portals,
      GSettings.PORTAL_LIFESPAN
    );
    applyForces(this.data);
    applySpeed(this.data);
    collisions(this.data);
    this.data.advance();
  }

  handleEvent(event: DataChangerEvent) {
    console.log(
      `PAST, type: '${typeof event}' event.time = ${
        event.time
      }, data.currentTime = ${this.data.currentTime}, data.actualNow = ${
        this.data.actualNow
      }`
    );
    if (event.time < 0) return;
    if (this.data.actualNow - event.time >= 100) {
      // too old, discard
      return;
    }
    if (event.time >= this.data.currentTime) {
      this.data.addEvent(event.time, event);
      return;
    }
    if (event.time < this.data.currentTime) {
      // console.log(
      //   `PAST, type: '${typeof event}' event.time = ${
      //     event.time
      //   }, data.currentTime = ${this.data.currentTime}, data.actualNow = ${
      //     this.data.actualNow
      //   }`
      // );
      // past event
      let now = this.data.currentTime;
      this.data.goBackTo(event.time);
      this.data.addEventNow(event);
      while (this.data.currentTime != now) {
        this.computeOneStep();
      }
      return;
    }
  }

  registerEvent(event: DataChangerEvent) {
    this.eventBuffer.push(event);
  }
}
