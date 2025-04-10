/**
 * This file re-exports all constants from the centralized game constants.
 * This ensures backward compatibility with any code importing from this file.
 * 
 * @deprecated Use direct imports from '../shared/constants/gameConstants.js' instead
 */

// Export all constants from the shared constants directory
export * from '../shared/constants/gameConstants.js';
export { default } from '../shared/constants/gameConstants.js';
