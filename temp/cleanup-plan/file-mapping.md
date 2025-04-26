# File Mapping for Reorganization

This document provides a detailed mapping of current files to their target locations, indicating which files need to be moved, renamed, removed, or created.

## Constants Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `shared/constants/baseConstants.js` | `src/constants/baseConstants.ts` | Convert to TS, Move |
| `shared/constants/gameConstants.js` | `src/constants/gameConstants.ts` | Convert to TS, Move |
| `src/js/shared/constants/baseConstants.js` | `src/constants/baseConstants.ts` | Merge, Remove |
| `src/js/shared/constants/gameConstants.js` | `src/constants/gameConstants.ts` | Merge, Remove |
| `src/js/core/constants.js` | `src/constants/uiConstants.ts` | Convert to TS, Move |
| `server/constants/serverConstants.js` | `server/constants/serverConstants.js` | Update imports |

## Core Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `src/core/Game.ts` | `src/core/Game.ts` | Keep |
| `src/core/GameConfig.ts` | `src/core/GameConfig.ts` | Keep |
| `src/core/GameMode.ts` | `src/core/GameMode.ts` | Keep |
| `src/core/MultiplayerMode.ts` | `src/core/MultiplayerMode.ts` | Keep |
| `src/core/SinglePlayerMode.ts` | `src/core/SinglePlayerMode.ts` | Keep |
| `src/js/Game.js` | - | Remove (replaced by TS version) |
| `src/js/core/GameConfig.js` | - | Remove (replaced by TS version) |
| `src/js/core/GameMode.js` | - | Remove (replaced by TS version) |
| `src/js/core/MultiplayerMode.js` | - | Remove (replaced by TS version) |
| `src/js/core/SinglePlayerMode.js` | - | Remove (replaced by TS version) |

## Entity Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `src/entities/Background.ts` | `src/entities/Background.ts` | Keep |
| `src/entities/Obstacle.ts` | `src/entities/Obstacle.ts` | Keep |
| `src/entities/ParticleSystem.ts` | `src/entities/ParticleSystem.ts` | Keep |
| `src/entities/Player.ts` | `src/entities/Player.ts` | Keep |
| `src/js/objects/Background.js` | - | Remove (replaced by TS version) |
| `src/js/objects/Obstacle.js` | - | Remove (replaced by TS version) |
| `src/js/objects/Player.js` | - | Remove (replaced by TS version) |
| `src/js/Background.js` | - | Remove (replaced by TS version) |
| `src/js/Obstacle.js` | - | Remove (replaced by TS version) |
| `src/js/ObstacleManager.js` | - | Remove (replaced by TS version) |
| `src/js/Player.js` | - | Remove (replaced by TS version) |
| `src/js/ParticleSystem.js` | - | Remove (replaced by TS version) |

## Manager Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `src/managers/AssetManager.ts` | `src/managers/AssetManager.ts` | Keep |
| `src/managers/InputManager.ts` | `src/managers/InputManager.ts` | Keep |
| `src/managers/ObstacleManager.ts` | `src/managers/ObstacleManager.ts` | Keep |
| `src/managers/UIManager.ts` | `src/managers/UIManager.ts` | Keep |
| `src/js/managers/AssetManager.js` | - | Remove (replaced by TS version) |
| `src/js/managers/InputManager.js` | - | Remove (replaced by TS version) |
| `src/js/managers/ObstacleManager.js` | - | Remove (replaced by TS version) |
| `src/js/managers/ParticleSystem.js` | - | Remove (replaced by TS version) |
| `src/js/managers/ResponsiveManager.js` | `src/managers/ResponsiveManager.ts` | Convert to TS, Move |
| `src/js/AssetManager.js` | - | Remove (replaced by TS version) |
| `src/js/InputManager.js` | - | Remove (replaced by TS version) |
| `src/js/MultiplayerManager.js` | - | Remove (replaced by TS version) |

## UI Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `src/ui/MultiplayerUI.ts` | `src/ui/MultiplayerUI.ts` | Keep |
| `src/ui/TouchControls.ts` | `src/ui/TouchControls.ts` | Keep |
| `src/js/ui/MultiplayerUI.js` | - | Remove (replaced by TS version) |
| `src/js/ui/TouchControls.js` | - | Remove (replaced by TS version) |
| `src/js/ui/UIManager.js` | - | Remove (replaced by TS version) |
| `src/js/MultiplayerUI.js` | - | Remove (replaced by TS version) |
| `src/js/TouchControls.js` | - | Remove (replaced by TS version) |
| `src/js/UIManager.js` | - | Remove (replaced by TS version) |

## Utility Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `src/utils/utils.ts` | `src/utils/utils.ts` | Keep |
| `src/js/utils/utils.js` | - | Remove (replaced by TS version) |
| `src/js/utils.js` | - | Remove (replaced by TS version) |

## Entry Point Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `app.js` | - | Remove (legacy wrapper) |
| `src/js/index.js` | `src/index.ts` | Convert to TS, Merge |
| `src/js/main.js` | `src/index.ts` | Merge into new file |
| `index.html` | - | Remove or update to point to src/index.html |
| `src/index.html` | `src/index.html` | Update script references |
| `src/basic-test.html` | - | Remove (test file) |
| `src/module-test.html` | - | Remove (test file) |
| `src/responsive-test.html` | - | Remove (test file) |

## Asset Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `style.css` | `src/styles/style.css` | Move |
| `public/images/*` | `src/assets/images/*` | Move |
| `src/assets/images/*` | `src/assets/images/*` | Keep |

## Configuration Files

| Current Location | Target Location | Action |
|------------------|----------------|--------|
| `vite.config.js` | `vite.config.js` | Update for new structure |
| `tsconfig.json` | `tsconfig.json` | Update path aliases |
| `.eslintrc.js` | `.eslintrc.js` | Update for TypeScript |
