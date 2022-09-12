import { GameEvent, GSettings } from "../constants";
import { GameState } from "../entities";
import { ElapsedTimeMeasurer } from "./ElapsedTimeMeasurer";
import {
  BarInputEvent,
  type BarInputEventStruct,
  type SpawnGravitonEventStruct,
  SpawnGravitonEvent,
  SpawnPortalEvent,
  type SpawnPortalEventStruct,
  type SetBallEventStruct,
  SetBallEvent,
} from "./events";

/**
 * Game represents the environment representing an ongoing game between two players.
 * It is meant to be the bridge between the 'unanimated' game state and the outside
 * (i.e. all the communication + game loop and time-related problematics).
 * Instanciated by both client (in ClientGameManager) and server (in ServerGameContext)
 */
export class Game {
  state: GameState = new GameState();
  score: [number, number] = [0, 0];
  elapsedTimeMeasurer: ElapsedTimeMeasurer = new ElapsedTimeMeasurer();
  timeAccumulated: number = 0;
  eventsCallback: Map<string, any>;

  constructor() {
    const eventsCallbackPairs: [string, any][] = [
      [GameEvent.START, this.start.bind(this)],
      [GameEvent.PAUSE, this.pause.bind(this)],
      [GameEvent.RESET, this.reset.bind(this)],
      [GameEvent.GOAL, this.goal.bind(this)],
      [
        GameEvent.RECEIVE_BAR_EVENT,
        (...eventArgs: BarInputEventStruct) => {
          this.state.registerEvent(new BarInputEvent(...eventArgs));
        },
      ],
      [
        GameEvent.SPAWN_GRAVITON,
        (...eventArgs: SpawnGravitonEventStruct) => {
          this.state.registerEvent(new SpawnGravitonEvent(...eventArgs));
        },
      ],
      [
        GameEvent.SPAWN_PORTAL,
        (...eventArgs: SpawnPortalEventStruct) => {
          this.state.registerEvent(new SpawnPortalEvent(...eventArgs));
        },
      ],
      [
        GameEvent.SET_BALL,
        (...eventArgs: SetBallEventStruct) => {
          console.log('set ball');
          this.state.registerEvent(new SetBallEvent(...eventArgs));
        },
      ],
    ];
    this.eventsCallback = new Map(eventsCallbackPairs);
  }

  on(event: string, callback: any) {
    this.eventsCallback.set(event, callback);
  }

  emit(event: string, ...args: any[]) {
    this.eventsCallback.get(event)?.call(this, ...args);
  }

  reset(ballX: number, ballY: number, ballSpeedX: number, ballSpeedY: number) {
    this.timeAccumulated = 0;
    this.elapsedTimeMeasurer.reset();
    this.state.reset(ballX, ballY, ballSpeedX, ballSpeedY);
  }

  goal(playerId: number) {
    this.score[1 - playerId]++;
  }

  start(startTime: number) {
    this.elapsedTimeMeasurer.start(startTime);
  }

  pause(pauseTime?: number) {
    this.elapsedTimeMeasurer.pause(pauseTime);
  }

  frame() {
    this.timeAccumulated += this.elapsedTimeMeasurer.frame();
    while (this.timeAccumulated >= GSettings.GAME_STEP_MS) {
      this.timeAccumulated -= GSettings.GAME_STEP_MS;
      this.state.update();
    }
  }

  isOver(): boolean {
    return (
      this.score[0] >= GSettings.GAME_SCORE_VICTORY ||
      this.score[1] >= GSettings.GAME_SCORE_VICTORY
    );
  }

  winner(): number {
    return this.score[0] >= this.score[1] ? 0 : 1;
  }
}
