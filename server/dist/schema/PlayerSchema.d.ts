import * as schema from "@colyseus/schema";
declare const Schema: typeof schema.Schema;
/**
 * Interface for movement keys
 */
interface MovementKeys {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}
/**
 * PlayerSchema defines the synchronized properties for each player
 */
declare class PlayerSchema extends Schema {
    sessionId: string;
    playerIndex: number;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    state: string;
    score: number;
    movementKeys: MovementKeys;
    lastUpdateTime: number;
    constructor(sessionId: string, playerIndex: number);
    /**
     * Reset player position for a new game
     * @param canvasWidth - Width of the game canvas
     * @param canvasHeight - Height of the game canvas
     */
    resetPosition(canvasWidth: number, canvasHeight: number): void;
    /**
     * Update player movement based on input
     * @param deltaTime - Time since last update in seconds
     * @param canvasWidth - Width of the game canvas
     * @param canvasHeight - Height of the game canvas
     */
    updateMovement(deltaTime: number, canvasWidth: number, canvasHeight: number): void;
    /**
     * Mark player as dead
     */
    markAsDead(): void;
    /**
     * Convert to spectator
     */
    becomeSpectator(): void;
}
export { PlayerSchema };
