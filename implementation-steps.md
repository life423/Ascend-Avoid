# Implementation Steps for Codebase Cleanup

## Step 1: Remove Duplicate JavaScript Files

```bash
# Remove duplicate JavaScript files in server directory
rm server/constants/serverConstants.js
rm server/rooms/GameRoom.js
rm server/schema/GameState.js
rm server/schema/ObstacleSchema.js
rm server/schema/PlayerSchema.js
rm server/config.js
rm server/index.js
```

## Step 2: Fix Import Paths

Update the import path in `server/constants/serverConstants.ts` to correctly import from the client constants:

```typescript
// Change from
import { 
  GAME_CONSTANTS, 
  PLAYER, 
  OBSTACLE, 
  GAME, 
  STATE, 
  PLAYER_STATE, 
  ARENA,
  PLAYER_COLORS 
} from '../../shared/constants/gameConstants.js';

// To
import { 
  GAME_CONSTANTS, 
  PLAYER, 
  OBSTACLE, 
  GAME, 
  STATE, 
  PLAYER_STATE, 
  ARENA,
  PLAYER_COLORS 
} from '../../src/constants/gameConstants';
```

## Step 3: Clean Up Test HTML Files

```bash
# Remove test HTML files
rm src/basic-test.html
rm src/module-test.html
rm src/responsive-test.html
```

## Step 4: Update Package Scripts

Ensure the server package.json scripts are updated to use TypeScript:

```json
"scripts": {
  "start": "ts-node index.ts",
  "dev": "ts-node-dev --respawn index.ts"
}
```

## Step 5: Clean Up Temporary Files

Review the cleanup plan in the temp directory and either implement it or remove it if no longer needed:

```bash
# If the plan is already implemented or no longer needed
rm -rf temp/cleanup-plan/
```

## Step 6: Update TypeScript Configuration

Ensure tsconfig.json has proper path aliases and includes all necessary files:

```json
{
  "compilerOptions": {
    // ... existing options ...
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@entities/*": ["src/entities/*"],
      "@managers/*": ["src/managers/*"],
      "@ui/*": ["src/ui/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@server/*": ["server/*"]
    }
  },
  "include": [
    "src/**/*.ts", 
    "src/**/*.d.ts", 
    "server/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

## Step 7: Testing

After each major change, test the application to ensure it still works correctly:

```bash
# Run client tests
npm run test

# Start the development server
npm run dev

# Start the game server
cd server && npm run dev
```

## Step 8: Final Verification

1. Verify that all duplicate files have been removed
2. Check that imports are working correctly
3. Ensure the application runs without errors
4. Test multiplayer functionality
5. Verify that the build process works correctly