/**
 * Configuration of the game data
 */

export class GSettings {
  // GAME ---->
  static readonly SCREEN_RATIO = 2;
  static readonly SCREEN_WIDTH = 4;
  static readonly SCREEN_HEIGHT =
    GSettings.SCREEN_WIDTH / GSettings.SCREEN_RATIO;
  static readonly SCREEN_TOP = -GSettings.SCREEN_HEIGHT / 2;
  static readonly SCREEN_BOTTOM = GSettings.SCREEN_HEIGHT / 2;
  static readonly SCREEN_LEFT = -GSettings.SCREEN_WIDTH / 2;
  static readonly SCREEN_RIGHT = GSettings.SCREEN_WIDTH / 2;
  static readonly GAME_WIDTH = 4;
  static readonly GAME_HEIGHT = (GSettings.SCREEN_HEIGHT * 23) / 25;
  static readonly GAME_TOP = -GSettings.GAME_HEIGHT / 2;
  static readonly GAME_BOTTOM = GSettings.GAME_HEIGHT / 2;
  static readonly GAME_LEFT = -GSettings.GAME_WIDTH / 2;
  static readonly GAME_RIGHT = GSettings.GAME_WIDTH / 2;
  static readonly GAME_SCORE_VICTORY = 3;

  // UID ----->
  static readonly SCORE_SIZE = GSettings.SCREEN_WIDTH / 30;
  static readonly SCORE_X = GSettings.SCREEN_WIDTH / 20;
  static readonly SCORE_Y = -GSettings.GAME_HEIGHT * (1 / 2 - 1 / 10);
  static readonly SCORE_PANEL_FONT = "64px Avenir Medium";
  static readonly SCORE_PANEL_FONT_SIZE = 64;
  static readonly SCORE_PANEL_TEXT_FILLSTYLE = "white";

  // PHYSIC -->
  static readonly GAME_STEP_MS = 1000 / 60;
  static readonly GAME_STEP_S = 1 / 60;
  static readonly SERVER_EMIT_INTERVAL = 2;

  // Initial values
  // BAR ----->
  static readonly BAR_WIDTH = GSettings.SCREEN_WIDTH / 40;
  static readonly BAR_HEIGHT = GSettings.SCREEN_WIDTH / 10;
  static readonly BAR_WIDTH_HALF = GSettings.BAR_WIDTH / 2;
  static readonly BAR_HEIGHT_HALF = GSettings.BAR_HEIGHT / 2;
  static readonly BAR_INITIALX = (17 / 40) * GSettings.SCREEN_WIDTH;
  static readonly BAR_INITIALY = 0;
  static readonly BAR_SENSITIVITY = (GSettings.SCREEN_WIDTH * 2) / 4;
  // Offline
  static readonly BAR_P1_UPKEYS = ["w", "z"];
  static readonly BAR_P1_DOWNKEYS = ["s"];
  static readonly BAR_P2_UPKEYS = ["ArrowUp"];
  static readonly BAR_P2_DOWNKEYS = ["ArrowDown"];
  // Online
  static readonly BAR_UPKEYS = [
    ...GSettings.BAR_P1_UPKEYS,
    ...GSettings.BAR_P2_UPKEYS,
  ];
  static readonly BAR_DOWNKEYS = [
    ...GSettings.BAR_P1_DOWNKEYS,
    ...GSettings.BAR_P2_DOWNKEYS,
  ];
  static readonly BAR_COLOR = "rgb(209, 64, 129)";
  static readonly BAR_COLLISION_EDGE =
    GSettings.BAR_INITIALX - GSettings.BAR_WIDTH / 2;

  // BALL ---->
  static readonly BALL_RADIUS = GSettings.SCREEN_WIDTH / 80;
  static readonly BALL_INITIAL_SPEEDX = GSettings.SCREEN_WIDTH / 4;
  static readonly BALL_RADIAL_SEGMENTS = 100;
  static readonly BALL_SPEEDX_INCREASE = GSettings.SCREEN_WIDTH / 20;
  static readonly BALL_SPEEDX_CORNER_BOOST = GSettings.BALL_SPEEDX_INCREASE * 2;
  static readonly BALL_SPEEDX_MAX = GSettings.SCREEN_WIDTH;
  static readonly BALL_SPEEDY_MAX = (GSettings.SCREEN_WIDTH * 12) / 20;
  static readonly BALL_SPEEDY_COLLISION_MAX =
    (GSettings.BALL_SPEEDY_MAX * 2) / 3;
  static readonly BALL_COLLISION_VY_RATIO =
    GSettings.BALL_SPEEDY_COLLISION_MAX /
    (GSettings.BAR_HEIGHT / 2 + GSettings.BALL_RADIUS);
  static readonly BALL_CONTROL_FRONTIER_X_CLIENT =
    GSettings.BAR_INITIALX - (1 / 10) * GSettings.SCREEN_WIDTH;
  static readonly BALL_CONTROL_FRONTIER_X_SERVER =
    GSettings.BAR_INITIALX - (2 / 10) * GSettings.SCREEN_WIDTH;
  static readonly BALL_SPEED_AT_LIMIT = GSettings.SCREEN_WIDTH / 20;
  static readonly BALL_CLIENT_SERVER_LERP_DIST = 0.05;
  static readonly BALL_CLIENT_SERVER_LERP_FACTOR = 0.05;
  static readonly BALL_COLOR = "rgb(255, 255, 255)";
  static readonly BALL_POS_ERROR_MAX = 0.03 * GSettings.SCREEN_WIDTH;
  static readonly BALL_SPEED_ERROR_MAX = 0.03 * GSettings.SCREEN_WIDTH;

  // SPRITES ->
  static readonly SPRITE_FRAME_RATE = 5;

  // GRAVITON ->
  static readonly GRAVITON_LIFESPAN = 500;
  static readonly GRAVITON_LIFESPAN_MS =
    GSettings.GRAVITON_LIFESPAN * GSettings.GAME_STEP_MS;
  static readonly GRAVITON_SPRITE_WIDTH = 128;
  static readonly GRAVITON_SPRITE_HEIGHT = 128;
  static readonly GRAVITON_OPENING_NFRAMES = 10;
  static readonly GRAVITON_PULLING_NFRAMES = 9;
  static readonly GRAVITON_OPENING_DURATION =
    GSettings.SPRITE_FRAME_RATE * GSettings.GRAVITON_OPENING_NFRAMES;
  static readonly GRAVITON_MAIN_DURATION =
    GSettings.GRAVITON_LIFESPAN - GSettings.GRAVITON_OPENING_DURATION;
  static readonly GRAVITON_END_DURATION = GSettings.GRAVITON_OPENING_DURATION;
  static readonly GRAVITON_SIZE = GSettings.SCREEN_WIDTH / 10;
  static readonly GRAVITON_FORCE_WIDTH_HALF = GSettings.SCREEN_WIDTH / 10;
  static readonly GRAVITON_FORCE_HEIGHT_HALF = GSettings.GRAVITON_SIZE / 4;
  static readonly GRAVITON_MAX_FORCE = 10;
  static readonly GRAVITON_SPAWN_WIDTH = GSettings.GAME_WIDTH / 2;
  static readonly GRAVITON_SPAWN_HEIGHT =
    GSettings.GAME_HEIGHT - GSettings.GRAVITON_SIZE;
  static readonly GRAVITON_SPAWN_DELAY = 500;
  static readonly GRAVITON_SPAWN_TMIN = GSettings.GRAVITON_LIFESPAN_MS * 0.5;
  static readonly GRAVITON_SPAWN_TMAX = GSettings.GRAVITON_LIFESPAN_MS;

  // PORTAL -->
  static readonly PORTAL_LIFESPAN = 600;
  static readonly PORTAL_LIFESPAN_MS =
    GSettings.PORTAL_LIFESPAN * GSettings.GAME_STEP_MS;
  static readonly PORTAL_SPRITE_WIDTH = 23;
  static readonly PORTAL_SPRITE_HEIGHT = 75;
  static readonly PORTAL_SPRITE_NFRAMES = 9;
  static readonly PORTAL_OPENING_DURATION =
    GSettings.SPRITE_FRAME_RATE * GSettings.PORTAL_SPRITE_NFRAMES;
  static readonly PORTAL_MAIN_DURATION =
    GSettings.PORTAL_LIFESPAN - GSettings.PORTAL_OPENING_DURATION;
  static readonly PORTAL_END_DURATION = GSettings.PORTAL_OPENING_DURATION;
  static readonly PORTAL_HEIGHT = GSettings.SCREEN_WIDTH / 8;
  static readonly PORTAL_RATIO =
    GSettings.PORTAL_SPRITE_WIDTH / GSettings.PORTAL_SPRITE_HEIGHT;
  static readonly PORTAL_WIDTH =
    GSettings.PORTAL_RATIO * GSettings.PORTAL_HEIGHT;
  static readonly PORTAL_SPAWN_XMIN = 0.05 * GSettings.SCREEN_WIDTH;
  static readonly PORTAL_SPAWN_XMAX = 0.25 * GSettings.SCREEN_WIDTH;
  static readonly PORTAL_SPAWN_HEIGHT =
    GSettings.GAME_HEIGHT - GSettings.PORTAL_HEIGHT;
  static readonly PORTAL_SPAWN_DELAY = 1000;
  static readonly PORTAL_SPAWN_TMIN = GSettings.PORTAL_LIFESPAN_MS * 1;
  static readonly PORTAL_SPAWN_TMAX = GSettings.PORTAL_LIFESPAN_MS * 1.5;

  // ANIMATION >
  static readonly VICTORY_ANIMATION_DURATION_MS = 1500;
  static readonly VICTORY_ANIMATION_SPEED = GSettings.BALL_SPEEDY_MAX;
  static readonly VICTORY_ANIMATION_COLOR = "rgb(255, 0, 0)";

  // BACKGROUND >
  static readonly BACKGROUND_COLOR_GREY = "rgb(173, 173, 173)";
  static readonly BACKGROUND_N_SUBDIVISIONS = 25;

  // ONLINE ---->
  static readonly ONLINE_SPAWN_DELAY = 10;
}

export const PLAYER1 = 0;
export const PLAYER2 = 1;

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}
export const LEFT = Direction.LEFT;
export const RIGHT = Direction.RIGHT;

export class GameEvent {
  // key: string, time: GameTime
  static readonly SEND_BAR_EVENT = "sendBarEvent";
  // key: string, time: GameTime
  static readonly RECEIVE_BAR_EVENT = "receiveBarEvent";
  // startTime: number
  static readonly START = "start";
  // pauseTime: number
  static readonly PAUSE = "pause";
  // playerId: number
  static readonly GOAL = "goal";
  // playerId: number
  static readonly BALL_OUT = "ballOut";
  // ballSpeedX: number, ballSpeedY: number
  static readonly RESET = "reset";
  //
  static readonly READY = "ready";
  // time: number, x: number, y: number
  static readonly SPAWN_GRAVITON = "spawnGraviton";
  // time: number, x1: number, y1: number, x2: number, y2: number
  static readonly SPAWN_PORTAL = "spawnPortal";
  // GameData
  static readonly OBSERVER_UPDATE = "observerUpdate";
  // playerId: number
  static readonly PLAYER_ID_CONFIRMED = "playerIdConfirmed";
  // score: [number, number]
  static readonly GAME_OVER = "gameOver";
  // playerId: number
  static readonly PLAYER_DISCONNECT = "playerDisconnect";
  //
  static readonly EXIT_GAME = "exitGame";
  //
  static readonly STOP_OBSERVING = "stopObserving";
  //
  static readonly SET_BALL = "setBall";
}

export enum KeyValue {
  UP,
  DOWN,
}
export const UP = KeyValue.UP;
export const DOWN = KeyValue.DOWN;

export type GameTime = number;

