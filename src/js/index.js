/**
 * Main entry point for the application.
 * Handles polyfills and imports the main application code.
 */

// Polyfills for Node.js modules
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Process polyfill for any libraries that might need it
import process from 'process';
window.process = process;

// Import the main application
import './main.js';

// Log initialization
console.log('Application initialized with polyfills loaded');
