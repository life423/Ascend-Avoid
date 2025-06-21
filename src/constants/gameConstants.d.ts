/**
 * Unified game constants shared between client and server
 * This file serves as the single source of truth for all game constants
 */
export declare const CANVAS: {
    BASE_WIDTH: number;
    BASE_HEIGHT: number;
    MAX_DESKTOP_WIDTH: number;
    MAX_MOBILE_WIDTH: number;
};
export declare const PLAYER: {
    readonly BASE_WIDTH: 30;
    readonly BASE_HEIGHT: 30;
    readonly MIN_STEP: 3;
    readonly BASE_SPEED: 5;
    readonly SIZE_RATIO: 0.04;
};
export declare const OBSTACLE: {
    readonly BASE_SPEED: 2;
    readonly MIN_WIDTH: 30;
    readonly MAX_WIDTH: 60;
    readonly MIN_WIDTH_RATIO: 0.08;
    readonly MAX_WIDTH_RATIO: 0.18;
};
export declare const PROJECTILE: {
    readonly WIDTH: 4;
    readonly HEIGHT: 8;
    readonly SPEED: 400;
    readonly BASE_SPEED: 400;
    readonly MAX_ACTIVE: 5;
    readonly MAX_COUNT: 5;
    readonly FIRE_RATE: 250;
    readonly COLOR: "#00ffff";
    readonly TRAIL_LENGTH: 3;
    readonly LIFETIME: 3000;
};
export declare const GAME: {
    readonly WINNING_LINE: 40;
    readonly MAX_PLAYERS: 30;
    readonly STATE_UPDATE_RATE: number;
    readonly ROOM_NAME: "last_player_standing";
    readonly MAX_OBSTACLES: 12;
    readonly DIFFICULTY_INCREASE_RATE: 0.15;
};
export declare const STATE: {
    readonly READY: "ready";
    readonly WAITING: "waiting";
    readonly STARTING: "starting";
    readonly PLAYING: "playing";
    readonly GAME_OVER: "game_over";
    readonly PAUSED: "paused";
};
export declare const PLAYER_STATE: {
    readonly ALIVE: "alive";
    readonly DEAD: "dead";
    readonly SPECTATING: "spectating";
};
export declare const ARENA: {
    readonly INITIAL_AREA_PERCENTAGE: 100;
    readonly SHRINK_INTERVAL: 30000;
    readonly SHRINK_PERCENTAGE: 10;
    readonly MIN_AREA_PERCENTAGE: 40;
};
export declare const KEYS: {
    readonly UP: readonly ["ArrowUp", "Up", "w", "W"];
    readonly DOWN: readonly ["ArrowDown", "Down", "s", "S"];
    readonly LEFT: readonly ["ArrowLeft", "Left", "a", "A"];
    readonly RIGHT: readonly ["ArrowRight", "Right", "d", "D"];
    readonly RESTART: readonly ["r", "R"];
    readonly SHOOT: readonly [" ", "Space", "Enter"];
};
export declare const PLAYER_COLORS: readonly ["#FF5252", "#FF9800", "#FFEB3B", "#4CAF50", "#00BCD4", "#64FFDA", "#E91E63", "#3F51B5", "#00E5FF", "#76FF03", "#FFC400", "#F50057", "#D500F9", "#00B0FF", "#F44336", "#FF5722", "#651FFF", "#2979FF", "#18FFFF", "#1DE9B6", "#00E676", "#C6FF00", "#FFC107", "#FF3D00", "#FF9100", "#FFEA00", "#76FF03"];
export declare const DEVICE_SETTINGS: {
    readonly DESKTOP: {
        readonly PLAYER_SIZE_RATIO: 0.035;
        readonly MIN_STEP: 10;
        readonly OBSTACLE_MIN_WIDTH_RATIO: 0.08;
        readonly OBSTACLE_MAX_WIDTH_RATIO: 0.18;
        readonly BASE_SPEED: 3.5;
        readonly DIFFICULTY_INCREASE_RATE: 0.18;
    };
    readonly MOBILE: {
        readonly PLAYER_SIZE_RATIO: 0.045;
        readonly MIN_STEP: 4;
        readonly OBSTACLE_MIN_WIDTH_RATIO: 0.1;
        readonly OBSTACLE_MAX_WIDTH_RATIO: 0.2;
        readonly BASE_SPEED: 2.5;
        readonly DIFFICULTY_INCREASE_RATE: 0.15;
    };
};
export declare const DESKTOP_SETTINGS: {
    readonly PLAYER_SIZE_RATIO: 0.035;
    readonly MIN_STEP: 10;
    readonly OBSTACLE_MIN_WIDTH_RATIO: 0.08;
    readonly OBSTACLE_MAX_WIDTH_RATIO: 0.18;
    readonly BASE_SPEED: 3.5;
    readonly DIFFICULTY_INCREASE_RATE: 0.18;
};
export declare const GAME_CONSTANTS: {
    readonly CANVAS: {
        BASE_WIDTH: number;
        BASE_HEIGHT: number;
        MAX_DESKTOP_WIDTH: number;
        MAX_MOBILE_WIDTH: number;
    };
    readonly PLAYER: {
        readonly BASE_WIDTH: 30;
        readonly BASE_HEIGHT: 30;
        readonly MIN_STEP: 3;
        readonly BASE_SPEED: 5;
        readonly SIZE_RATIO: 0.04;
    };
    readonly OBSTACLE: {
        readonly BASE_SPEED: 2;
        readonly MIN_WIDTH: 30;
        readonly MAX_WIDTH: 60;
        readonly MIN_WIDTH_RATIO: 0.08;
        readonly MAX_WIDTH_RATIO: 0.18;
    };
    readonly PROJECTILE: {
        readonly WIDTH: 4;
        readonly HEIGHT: 8;
        readonly SPEED: 400;
        readonly BASE_SPEED: 400;
        readonly MAX_ACTIVE: 5;
        readonly MAX_COUNT: 5;
        readonly FIRE_RATE: 250;
        readonly COLOR: "#00ffff";
        readonly TRAIL_LENGTH: 3;
        readonly LIFETIME: 3000;
    };
    readonly GAME: {
        readonly WINNING_LINE: 40;
        readonly MAX_PLAYERS: 30;
        readonly STATE_UPDATE_RATE: number;
        readonly ROOM_NAME: "last_player_standing";
        readonly MAX_OBSTACLES: 12;
        readonly DIFFICULTY_INCREASE_RATE: 0.15;
    };
    readonly STATE: {
        readonly READY: "ready";
        readonly WAITING: "waiting";
        readonly STARTING: "starting";
        readonly PLAYING: "playing";
        readonly GAME_OVER: "game_over";
        readonly PAUSED: "paused";
    };
    readonly PLAYER_STATE: {
        readonly ALIVE: "alive";
        readonly DEAD: "dead";
        readonly SPECTATING: "spectating";
    };
    readonly ARENA: {
        readonly INITIAL_AREA_PERCENTAGE: 100;
        readonly SHRINK_INTERVAL: 30000;
        readonly SHRINK_PERCENTAGE: 10;
        readonly MIN_AREA_PERCENTAGE: 40;
    };
    readonly KEYS: {
        readonly UP: readonly ["ArrowUp", "Up", "w", "W"];
        readonly DOWN: readonly ["ArrowDown", "Down", "s", "S"];
        readonly LEFT: readonly ["ArrowLeft", "Left", "a", "A"];
        readonly RIGHT: readonly ["ArrowRight", "Right", "d", "D"];
        readonly RESTART: readonly ["r", "R"];
        readonly SHOOT: readonly [" ", "Space", "Enter"];
    };
    readonly DEVICE_SETTINGS: {
        readonly DESKTOP: {
            readonly PLAYER_SIZE_RATIO: 0.035;
            readonly MIN_STEP: 10;
            readonly OBSTACLE_MIN_WIDTH_RATIO: 0.08;
            readonly OBSTACLE_MAX_WIDTH_RATIO: 0.18;
            readonly BASE_SPEED: 3.5;
            readonly DIFFICULTY_INCREASE_RATE: 0.18;
        };
        readonly MOBILE: {
            readonly PLAYER_SIZE_RATIO: 0.045;
            readonly MIN_STEP: 4;
            readonly OBSTACLE_MIN_WIDTH_RATIO: 0.1;
            readonly OBSTACLE_MAX_WIDTH_RATIO: 0.2;
            readonly BASE_SPEED: 2.5;
            readonly DIFFICULTY_INCREASE_RATE: 0.15;
        };
    };
};
export default GAME_CONSTANTS;
