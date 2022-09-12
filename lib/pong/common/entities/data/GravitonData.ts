import { type Spawnable } from "./spawnable";

/**
 * Structure for a graviton's data
 * Grouped with the other entities in GameData
 */
export class GravitonData implements Spawnable {
  x: number = 0;
  y: number = 0;
  age: number = 0;

  constructor() {}
}

