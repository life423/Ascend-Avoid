/**
 * Server-specific constants for the game server
 * Imports base constants and adds server-specific values
 */
import { GAME_CONSTANTS, PLAYER, OBSTACLE, GAME, STATE, PLAYER_STATE, ARENA, PLAYER_COLORS } from '../../src/constants/gameConstants';
export declare const SERVER: {
    DEFAULT_PORT: number;
    PING_INTERVAL: number;
    PING_MAX_RETRIES: number;
    MONITOR_PATH: string;
};
export declare const NETWORK: {
    MAX_MESSAGE_SIZE: number;
    MESSAGE_TIMEOUT: number;
};
export { GAME_CONSTANTS, PLAYER, OBSTACLE, GAME, STATE, PLAYER_STATE, ARENA, PLAYER_COLORS };
