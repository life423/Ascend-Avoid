# Ascend Avoid Codebase Cleanup Plan

## Current Issues

1. **Duplicate Files**: JavaScript and TypeScript versions of the same files coexist
2. **Inconsistent Structure**: Files with similar purposes are organized differently
3. **Multiple Entry Points**: Multiple HTML files and JavaScript entry points
4. **Duplicate Constants**: Constants defined in multiple locations
5. **Incomplete TypeScript Migration**: Migration started but not completed

## Cleanup Plan

### Phase 1: Remove Duplicate Files

1. **Remove JavaScript duplicates where TypeScript versions exist**
   - Remove `server/constants/serverConstants.js` (keep `.ts` version)
   - Remove `server/rooms/GameRoom.js` (keep `.ts` version)
   - Remove `server/schema/*.js` files (keep `.ts` versions)
   - Remove `server/config.js` (keep `.ts` version)
   - Remove `server/index.js` (keep `.ts` version)

### Phase 2: Fix Constants and Imports

1. **Update server constants to import from client**
   - Fix import path in `server/constants/serverConstants.ts` to correctly import from `src/constants/gameConstants`

2. **Standardize import paths**
   - Use consistent relative paths or path aliases
   - Update any absolute path imports

### Phase 3: Clean Up Entry Points

1. **Remove unnecessary HTML files**
   - Remove `src/basic-test.html`
   - Remove `src/module-test.html`
   - Remove `src/responsive-test.html`

2. **Ensure single entry point**
   - Verify `src/index.ts` is the main entry point
   - Remove any legacy entry points

### Phase 4: Update Configuration Files

1. **Update build configurations**
   - Ensure `vite.config.js` is properly configured
   - Verify `tsconfig.json` path aliases

2. **Update package scripts**
   - Ensure npm scripts are consistent between client and server

### Phase 5: Clean Up Temporary Files

1. **Review and implement or remove temp directory**
   - Either implement the cleanup plan in `temp/cleanup-plan/` or remove it if no longer needed

### Phase 6: Testing

1. **Test the application**
   - Verify the client works correctly
   - Test the server functionality
   - Ensure multiplayer features work

## Implementation Steps

1. **Backup the codebase** before making changes
2. **Remove duplicate JavaScript files** where TypeScript versions exist
3. **Fix import paths** in server constants
4. **Remove unnecessary HTML files**
5. **Update configuration files** if needed
6. **Test the application** after each major change