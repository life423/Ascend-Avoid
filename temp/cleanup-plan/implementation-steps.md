# Implementation Steps for Code Cleanup

## Phase 1: Organize Constants and Shared Code

1. **Consolidate Constants**:
   - Move and merge `shared/constants/` and `src/js/shared/constants/` into a single `src/constants/` directory
   - Convert all constants to TypeScript (*.ts files)
   - Ensure server code imports from the right location

2. **Update Type Definitions**:
   - Ensure all types in `src/types.d.ts` are complete and reflect the actual codebase
   - Add missing interfaces and types for a fully typed codebase

## Phase 2: Clean Up Entry Points

1. **Consolidate HTML Files**:
   - Keep only `src/index.html` as the single HTML entry point
   - Remove or update redirecting HTML files

2. **Create a Single JavaScript Entry Point**:
   - Create a new `src/index.ts` that replaces both `src/js/index.js` and `src/js/main.js`
   - Update the HTML file to reference this new entry point
   - Remove legacy entry points like `app.js`

3. **Update Vite Configuration**:
   - Update `vite.config.js` to reflect the new structure
   - Ensure proper aliasing for paths

## Phase 3: Migrate Remaining JavaScript Files to TypeScript

1. **For Each Module**:
   - If a TypeScript version already exists, remove the JavaScript version
   - If no TypeScript version exists, create one by converting the JavaScript file
   - Update all imports to reference the TypeScript files

2. **Directory Specific Actions**:
   - **src/js/core/** → Move to `src/core/` (TypeScript)
   - **src/js/managers/** → Move to `src/managers/` (TypeScript)
   - **src/js/ui/** → Move to `src/ui/` (TypeScript)
   - **src/js/objects/** → Move to `src/entities/` (TypeScript)
   - **src/js/utils/** → Move to `src/utils/` (TypeScript)

## Phase 4: Update Import Paths

1. **Standardize Import Paths**:
   - Remove absolute path imports (e.g., `/js/...`)
   - Use relative paths or path aliases consistently
   - Update import statements throughout the codebase

2. **Update Path Aliases**:
   - Update any path aliases in `tsconfig.json` and `vite.config.js`
   - Ensure aliases match the new directory structure

## Phase 5: Clean Up Styles and Assets

1. **Organize CSS**:
   - Move `style.css` to `src/styles/style.css`
   - Update HTML references

2. **Organize Assets**:
   - Move images and sounds to `src/assets/{images, sounds}/`
   - Update asset references in code

## Phase 6: Testing and Validation

1. **Run the Application**:
   - Test the application after each major phase
   - Fix any issues that arise

2. **Code Quality**:
   - Run linters and TypeScript compiler to catch errors
   - Fix any issues that arise
   - Ensure all files use consistent formatting
   - Remove any remaining unnecessary comments or console logs

## Phase 7: Multiplayer Preparation

1. **Review Server Integration**:
   - Ensure server code properly integrates with the refactored client code
   - Update any server references in the client code

2. **Colyseus Integration Check**:
   - Ensure all multiplayer functionality works with the refactored code
   - Test multiplayer connections
