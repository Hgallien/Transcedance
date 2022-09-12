/**
 * Callbacks for the listening of keyboard events, i.e. for the players to control the bar(s).
 */

import { Socket } from "socket.io-client";
import {
  DOWN,
  GameEvent,
  GSettings,
  KeyValue,
  UP,
} from "../../common/constants";
import { GameState } from "../../common/entities";
import { Game } from "../../common/game";
import { BarInputEvent } from "../../common/game/events";
import { ClientGameContextOffline } from "../ClientGameContextOffline";
import { ClientGameContextOnline } from "../ClientGameContextOnline";

export function handleKeydownOffline(e: KeyboardEvent, state: GameState) {
  let barIdAndKey = barIdAndKeyFromEventOffline(e);
  if (barIdAndKey)
    keyAction(state, barIdAndKey[0], barIdAndKey[1], true);
}
export function handleKeyupOffline(e: KeyboardEvent, state: GameState) {
  let barIdAndKey = barIdAndKeyFromEventOffline(e);
  if (barIdAndKey)
    keyAction(state, barIdAndKey[0], barIdAndKey[1], false);
}

function barIdAndKeyFromEventOffline(
  e: KeyboardEvent
): [number, KeyValue] | null {
  if (GSettings.BAR_P1_UPKEYS.includes(e.key)) {
    return [0, UP];
  } else if (GSettings.BAR_P1_DOWNKEYS.includes(e.key)) {
    return [0, DOWN];
  } else if (GSettings.BAR_P2_UPKEYS.includes(e.key)) {
    return [1, UP];
  } else if (GSettings.BAR_P2_DOWNKEYS.includes(e.key)) {
    return [1, DOWN];
  } else return null;
}

export function handleKeyOnline(
  e: KeyboardEvent,
  state: GameState,
  playerId: number,
  socket: Socket,
  pressed: boolean
) {
  if (GSettings.BAR_UPKEYS.includes(e.key))
    keyActionOnline(state, socket, playerId, UP, pressed);
  else if (GSettings.BAR_DOWNKEYS.includes(e.key))
    keyActionOnline(state, socket, playerId, DOWN, pressed);
}

export function keyAction(state: GameState, playerId: number, keyValue: KeyValue, pressed: boolean) {
  state.registerEvent(
    new BarInputEvent(
      state.data.actualNow,
      playerId,
      keyValue,
      pressed
    )
  );
}


export function keyActionOnline(state: GameState, socket: Socket, playerId: number, keyValue: KeyValue, pressed: boolean) {
  keyAction(state, playerId, keyValue, pressed);
  socket.emit(
    GameEvent.SEND_BAR_EVENT,
    state.data.actualNow,
    playerId,
    keyValue,
    pressed
  );
}


export function setupKeyboardOffline(ctx: ClientGameContextOffline) {
  const game = ctx.gameManager.game;
  ctx.registerWindowListener(
    "keydown",
    (e: Event) => handleKeydownOffline(e as KeyboardEvent, game.state),
    false
  );
  ctx.registerWindowListener(
    "keyup",
    (e: Event) => handleKeyupOffline(e as KeyboardEvent, game.state),
    false
  );
}

export function setupKeyboardOnline(
  ctx: ClientGameContextOnline,
  playerId: number,
  socket: Socket
) {
  const game = ctx.gameManager.game;
  ctx.registerWindowListener(
    "keydown",
    (e: Event) =>
      handleKeyOnline(e as KeyboardEvent, game.state, playerId, socket, true),
      false
  );
  ctx.registerWindowListener(
    "keyup",
    (e: Event) =>
      handleKeyOnline(e as KeyboardEvent, game.state, playerId, socket, false),
      false
  );
}
