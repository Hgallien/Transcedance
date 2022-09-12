import { GameEvent } from "./constants";
import { BarInputEvent } from "./game";

export interface ServerToClientEvents {
  [GameEvent.RECEIVE_BAR_EVENT]: (time: number, ...args: ConstructorParameters<typeof BarInputEvent>) => void;
  [GameEvent.START]: () => void;
  [GameEvent.PAUSE]: () => void;
  [GameEvent.GOAL]: () => void;
  [GameEvent.RESET]: () => void;
  [GameEvent.SPAWN_GRAVITON]: () => void;
  [GameEvent.SPAWN_PORTAL]: () => void;
  [GameEvent.OBSERVER_UPDATE]: () => void;
  [GameEvent.PLAYER_ID_CONFIRMED]: () => void;
}

export interface ClientToServerEvents {
  [GameEvent.SEND_BAR_EVENT]: () => void;
  [GameEvent.RECEIVE_BAR_EVENT]: () => void;
  [GameEvent.BALL_OUT]: () => void;
  [GameEvent.READY]: () => void;
}
