import { GameData, GravitonData, PortalData } from ".";
import { type DataChanger, type DataChangerEvent } from "../../game/events";
import { GameObjectPool } from "./GameObjectPool";
// import { PlainObject } from "../../utils";

/**
 * The actual bufferized state of a Game
 * The size of the buffer is fixed to limit memory usage, but the
 * size of the event buffer is illimited (allow to register future events)
 */
export class GameDataBuffer {
  dataArray: GameData[] = Array.from({ length: 100 }, () => new GameData());
  eventsArray: DataChanger[][] = [];

  currentIndex!: number;
  nextIndex!: number;
  currentTime!: number;
  actualNow!: number;

  current!: GameData;
  next!: GameData;

  //
  gravitonPool = new (GameObjectPool(GravitonData, 300))();
  portalPool = new (GameObjectPool(PortalData, 100))();

  constructor() {
    this.reset();
  }

  get eventsNow(): DataChanger[] | null {
    return this.currentTime in this.eventsArray
      ? this.eventsArray[this.currentTime]
      : null;
  }

  setCurrentIndex(value: number) {
    this.currentIndex = value;
    this.nextIndex = (value + 1) % 100;
    this.current = this.dataArray[this.currentIndex];
    this.next = this.dataArray[this.nextIndex];
  }

  incrementCurrentIndex() {
    this.setCurrentIndex(this.nextIndex);
  }

  addEventNow(event: DataChangerEvent) {
    this.addEvent(this.currentTime, event);
  }

  addEvent(time: number, event: DataChangerEvent) {
    const dataChanger = event.process.bind(event);
    if (!(time in this.eventsArray)) this.eventsArray[time] = [dataChanger];
    else this.eventsArray[time].push(dataChanger);
  }

  advance() {
    this.currentTime++;
    this.incrementCurrentIndex();
  }

  reset() {
    this.currentTime = 0;
    this.actualNow = 0;
    this.setCurrentIndex(0);
    this.current.reset();
    this.eventsArray = [];
  }

  addGraviton(x: number, y: number): void {
    // let graviton = new GravitonData(x, y);
    let graviton = this.newGravitonDataFromCoords(x, y);
    this.current.gravitons.add(graviton);
  }

  addPortal(x1: number, y1: number, x2: number, y2: number): void {
    // let portal = new PortalData(x1, y1, x2, y2);
    let portal = this.newPortalDataFromCoords(x1, y1, x2, y2);
    this.current.portals.add(portal);
  }

  goBackTo(time: number) {
    let timeIndex = (time - this.currentTime + this.currentIndex + 100) % 100;
    this.currentTime = time;
    this.setCurrentIndex(timeIndex);
  }

  newGravitonDataFromCoords(x: number, y: number): GravitonData {
    const graviton = this.gravitonPool.getGameObject() as GravitonData;
    graviton.x = x;
    graviton.y = y;
    return graviton;
  }

  newPortalDataFromCoords(x1: number, y1: number, x2: number, y2: number): PortalData{
    const portal = this.portalPool.getGameObject() as PortalData;
    portal.setPosition(x1, y1, x2, y2);
    return portal;
  }

  newGravitonByCopy(other: GravitonData): GravitonData {
    const graviton = this.gravitonPool.getGameObject() as GravitonData;
    Object.assign(graviton, other);
    return graviton;
  }

  newPortalByCopy(other: PortalData): PortalData {
    const portal = this.portalPool.getGameObject() as PortalData;
    Object.assign(portal, other);
    return portal;
  }
}
