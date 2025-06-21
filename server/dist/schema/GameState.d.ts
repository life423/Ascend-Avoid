import * as schema from "@colyseus/schema";
declare const Schema: typeof schema.Schema;
import { PlayerSchema } from "./PlayerSchema.js";
import { ObstacleSchema } from "./ObstacleSchema.js";
/**
 * GameState defines the full synchronized game state
 */
declare class GameState extends Schema {
    gameState: string;
    elapsedTime: number;
    startTime: number;
    countdownTime: number;
    arenaWidth: number;
    arenaHeight: number;
    areaPercentage: number;
    nextShrinkTime: number;
    players: schema.MapSchema<PlayerSchema>;
    obstacles: schema.ArraySchema<ObstacleSchema>;
    aliveCount: number;
    totalPlayers: number;
    winnerName: string;
    lastUpdateTime: number;
    constructor();
    /**
     * Initialize a new player
     * @param sessionId - The client session ID
     * @returns The created player
     */
    createPlayer(sessionId: string): PlayerSchema;
    /**
     * Remove a player by session ID
     * @param sessionId - The client session ID
     */
    removePlayer(sessionId: string): void;
    /**
     * Initialize obstacles
     * @param initialCount - Initial number of obstacles
     */
    initializeObstacles(initialCount?: number): void;
    /**
     * Create a new obstacle
     * @returns The created obstacle
     */
    createObstacle(): ObstacleSchema;
    /**
     * Check for win condition
     * @returns Whether the game is over
     */
    checkWinCondition(): boolean;
    /**
     * Update game state
     * @param deltaTime - Time since last update
     */
    update(deltaTime: number): void;
    /**
     * Check if player is inside the arena boundaries
     * @param player - The player to check
     */
    checkPlayerInArena(player: PlayerSchema): void;
    /**
     * Check if obstacle collides with any players
     * @param obstacle - The obstacle to check
     */
    checkObstacleCollisions(obstacle: ObstacleSchema): void;
    /**
     * Reset game state for a new round
     */
    resetGame(): void;
}
export { GameState };
