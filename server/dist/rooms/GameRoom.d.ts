import pkg from 'colyseus';
declare const Room: typeof pkg.Room;
import { GameState } from "../schema/GameState";
import { Client } from "colyseus";
/**
 * Type definitions for room messages
 */
interface JoinOptions {
    name?: string;
    width?: number;
    height?: number;
}
/**
 * Last Player Standing Game Room
 * Handles up to 30 players in a battle royale style game
 */
declare class GameRoom extends Room<GameState> {
    private updateInterval;
    constructor();
    /**
     * Initialize room state when created
     */
    onCreate(options?: JoinOptions): void;
    /**
     * Setup message handlers for client communication
     */
    setupMessageHandlers(): void;
    /**
     * Handle client joining the room
     */
    onJoin(client: Client, options?: JoinOptions): void;
    /**
     * Handle client leaving the room
     */
    onLeave(client: Client, consented: boolean): void;
    /**
     * Main game loop
     */
    gameLoop(): void;
    /**
     * Clean up when room is disposed
     */
    onDispose(): void;
}
export { GameRoom };
