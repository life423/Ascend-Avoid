# Updated TypeScript Configuration

Here's the proposed updated TypeScript configuration file that will support our new file structure:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    
    /* For mixed JS/TS projects */
    "allowJs": true,
    "checkJs": false,
    
    /* Type Checking - gradually increase strictness over time */
    "strict": false,         /* Will enable later after full migration */
    "noImplicitAny": false,  /* Will enable later after full migration */
    "strictNullChecks": false,
    
    /* Path aliases to match the new directory structure */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@entities/*": ["src/entities/*"],
      "@managers/*": ["src/managers/*"],
      "@ui/*": ["src/ui/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": [
    "src/**/*.ts", 
    "src/**/*.d.ts", 
    "src/**/*.tsx",
    "src/**/*.js",
    "shared/**/*.ts",
    "shared/**/*.js"
  ],
  "exclude": ["node_modules", "dist"]
}
```

This updated configuration:

1. Updates path aliases to match our new structure and the Vite config
2. Keeps the same compilation options for incremental TypeScript migration
3. Adds shared directory to the includes list
4. Maintains backward compatibility with existing JavaScript files during migration
5. Sets up for future increased strictness as the codebase is fully migrated
