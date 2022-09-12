/**
 * Utility functions
 */

import { GSettings } from "./constants";

export function delay(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}
  add(v: Vector2) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
}

export function randomGravitonCoords(): [number, number] {
  return [
    GSettings.GRAVITON_SPAWN_WIDTH * (Math.random() - 0.5),
    GSettings.GRAVITON_SPAWN_HEIGHT * (Math.random() - 0.5),
  ];
}

function rangedRandomValue(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randomPortalCoords(): [number, number, number, number] {
  return [
    -rangedRandomValue(
      GSettings.PORTAL_SPAWN_XMIN,
      GSettings.PORTAL_SPAWN_XMAX
    ),
    rangedRandomValue(GSettings.PORTAL_SPAWN_XMIN, GSettings.PORTAL_SPAWN_XMAX),
    GSettings.PORTAL_SPAWN_HEIGHT * (Math.random() - 0.5),
    GSettings.PORTAL_SPAWN_HEIGHT * (Math.random() - 0.5),
  ];
}

export function removeIfPresent<T>(array: Array<T>, element: T) {
  const i = array.indexOf(element);
  if (i != -1) array.splice(i, 1);
}


export type FinishCallback = (score1: number, score2: number) => void;
export type FinallyCallback = () => void;
export type ErrorCallback = (message: string) => void;

type Callback = (...args: any) => any;
type OnOffMethods = (event: string, listener: Callback) => any;
export class Listeners<Socket extends { on: OnOffMethods, off: OnOffMethods } > {
  array: [socket: Socket, event: string, listener: Callback][] = [];
  add(socket: Socket, event: string, listener: Callback) {
    socket.on(event, listener);
    this.array.push([socket, event, listener]);
  }

  removeAll() {
    for (let [socket, event, listener] of this.array) {
      socket.off(event, listener);
    }
  }
}
