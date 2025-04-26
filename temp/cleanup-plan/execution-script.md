# Execution Plan

Below is a step-by-step execution plan that we can follow to clean up the codebase. Each step should be executed in order, with verification and testing between major steps.

## Phase 1: Directory Structure Setup

```bash
# Create new directories if they don't exist
mkdir -p src/constants
mkdir -p src/styles

# We'll use these directories to store our constants and styles
```

## Phase 2: Constants Consolidation

1. First, create the consolidated TypeScript constants files:

```bash
# Create the gameConstants.ts file
cp temp/cleanup-plan/updated-constants.md src/constants/gameConstants.ts
# Edit the file to remove markdown formatting
```

2. Update the server imports to reference the new location:

```javascript
// In server/constants/serverConstants.js, update imports:
import { GAME, STATE, PLAYER_STATE } from '../../src/constants/gameConstants.js';
```

## Phase 3: Entry Points Consolidation

1. Create the new unified entry point:

```bash
# Create the new src/index.ts file
cp temp/cleanup-plan/new-entry-point.md src/index.ts
# Edit the file to remove markdown formatting
```

2. Update the HTML reference in src/index.html:

```html
<!-- Replace this line in src/index.html -->
<script type="module" src="js/index.js"></script>
<!-- With this -->
<script type="module" src="index.ts"></script>
```

3. Remove the legacy wrapper:

```bash
# Remove the legacy app.js wrapper
rm app.js
```

4. Update the root index.html to directly point to src/index.html:

```html
<!-- In index.html, change -->
<meta http-equiv="refresh" content="0;url=src/index.html">
<!-- To -->
<meta http-equiv="refresh" content="0;url=src/index.html?direct=true">
```

## Phase 4: Moving Files

1. First, move the style files:

```bash
# Move style.css to the styles directory
cp style.css src/styles/style.css

# Update references in src/index.html
# Change: <link rel="stylesheet" href="styles/style.css">
```

2. Move assets:

```bash
# Move images from public to src/assets
cp -r public/images/* src/assets/images/
```

## Phase 5: Remove Duplicate Files

Now that we've set up the structure and migrated the constants, we can start removing duplicate files:

```bash
# Remove JavaScript files that have TypeScript equivalents
rm -f src/js/Game.js
rm -f src/js/core/GameConfig.js
rm -f src/js/core/GameMode.js
rm -f src/js/core/MultiplayerMode.js
rm -f src/js/core/SinglePlayerMode.js
rm -f src/js/objects/Background.js
rm -f src/js/objects/Obstacle.js
rm -f src/js/objects/Player.js
rm -f src/js/Background.js
rm -f src/js/Obstacle.js
rm -f src/js/ObstacleManager.js
rm -f src/js/Player.js
rm -f src/js/ParticleSystem.js
rm -f src/js/managers/AssetManager.js
rm -f src/js/managers/InputManager.js
rm -f src/js/managers/ObstacleManager.js
rm -f src/js/managers/ParticleSystem.js
rm -f src/js/AssetManager.js
rm -f src/js/InputManager.js
rm -f src/js/MultiplayerManager.js
rm -f src/js/ui/MultiplayerUI.js
rm -f src/js/ui/TouchControls.js
rm -f src/js/ui/UIManager.js
rm -f src/js/MultiplayerUI.js
rm -f src/js/TouchControls.js
rm -f src/js/UIManager.js
rm -f src/js/utils/utils.js
rm -f src/js/utils.js

# Remove test HTML files
rm -f src/basic-test.html
rm -f src/module-test.html
rm -f src/responsive-test.html

# Remove other duplicate files
rm -f src/js/index.js
rm -f src/js/main.js
```

## Phase 6: Configuration Updates

1. Update Vite configuration:

```bash
# Update vite.config.js
cp temp/cleanup-plan/updated-vite-config.md vite.config.js
# Edit the file to remove markdown formatting
```

2. Update TypeScript configuration:

```bash
# Update tsconfig.json
cp temp/cleanup-plan/updated-tsconfig.md tsconfig.json
# Edit the file to remove markdown formatting
```

## Phase 7: Deal with ResponsiveManager

Since ResponsiveManager.ts doesn't exist yet, we need to convert the JavaScript version to TypeScript:

```bash
# Create the TypeScript version from the JavaScript one
cp src/js/managers/ResponsiveManager.js src/managers/ResponsiveManager.ts
# Manually add TypeScript types to ResponsiveManager.ts
```

## Phase 8: Testing and Validation

1. Run the TypeScript compiler to check for errors:

```bash
npx tsc --noEmit
```

2. Start the development server to test the changes:

```bash
npm run dev
```

3. Check that the game still works correctly:
   - Test that single player mode works
   - Test that responsive design works on different screen sizes
   - Verify all game mechanics are still functional

## Phase 9: Final Cleanup

1. After confirming everything works, you can remove the shared constants directory since they've been consolidated:

```bash
rm -rf shared/constants
rm -rf src/js/shared
```

2. Update any remaining imports in the TypeScript files:

```bash
# Use search and replace to find any absolute path imports like /js/...
# and replace them with relative imports
```

3. Run ESLint to clean up any code style issues:

```bash
npm run lint:js
```
