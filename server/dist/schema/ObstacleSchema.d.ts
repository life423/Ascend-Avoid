import * as schema from "@colyseus/schema";
declare const Schema: typeof schema.Schema;
/**
 * Interface for player position (used in obstacle placement)
 */
interface PlayerPosition {
    x: number;
    y: number;
}
/**
 * ObstacleSchema defines the synchronized properties for each obstacle
 */
declare class ObstacleSchema extends Schema {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    variant: number;
    active: boolean;
    constructor(id: number);
    /**
     * Reset obstacle to a new position
     * @param canvasWidth - Width of the game canvas
     * @param canvasHeight - Height of the game canvas
     * @param playerPositions - Array of player positions to avoid when placing obstacle
     * @returns Whether the reset was successful
     */
    reset(canvasWidth: number, canvasHeight: number, playerPositions?: PlayerPosition[]): boolean;
    /**
     * Update obstacle position
     * @param deltaTime - Time since last update in seconds
     * @param canvasWidth - Width of the game canvas
     * @param score - Current game score
     * @returns Whether the obstacle needs to be reset
     */
    update(deltaTime: number, canvasWidth: number, score?: number): boolean;
    /**
     * Check for collision with a player
     * @param player - The player to check collision against
     * @returns Whether a collision occurred
     */
    checkCollision(player: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): boolean;
}
export { ObstacleSchema };
