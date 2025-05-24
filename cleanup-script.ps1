# Ascend Avoid Cleanup Script
# This script implements steps 1-4 of the cleanup plan:
# 1. Complete TypeScript Migration
# 2. Fix Import Paths
# 3. Clean Up Test Files
# 4. Update Configuration Files

Write-Host "Starting Ascend Avoid codebase cleanup..." -ForegroundColor Cyan

# Step 1: Remove JavaScript duplicates where TypeScript versions exist
Write-Host "`n[Step 1] Removing JavaScript duplicates..." -ForegroundColor Green

$jsFilesToRemove = @(
    "server\constants\serverConstants.js",
    "server\rooms\GameRoom.js",
    "server\schema\GameState.js",
    "server\schema\ObstacleSchema.js",
    "server\schema\PlayerSchema.js",
    "server\config.js",
    "server\index.js"
)

foreach ($file in $jsFilesToRemove) {
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "  Removed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "  Already removed: $file" -ForegroundColor Gray
    }
}

# Step 2: Fix Import Paths in serverConstants.ts
Write-Host "`n[Step 2] Fixing import paths..." -ForegroundColor Green

$serverConstantsPath = Join-Path -Path $PSScriptRoot -ChildPath "server\constants\serverConstants.ts"
if (Test-Path $serverConstantsPath) {
    $content = Get-Content -Path $serverConstantsPath -Raw
    
    # Check if the import path needs to be fixed
    if ($content -match "from '../../shared/constants/gameConstants") {
        $updatedContent = $content -replace "from '../../shared/constants/gameConstants.*?'", "from '../../src/constants/gameConstants'"
        Set-Content -Path $serverConstantsPath -Value $updatedContent
        Write-Host "  Fixed import path in serverConstants.ts" -ForegroundColor Yellow
    } else {
        Write-Host "  Import path in serverConstants.ts already correct" -ForegroundColor Gray
    }
} else {
    Write-Host "  serverConstants.ts not found" -ForegroundColor Red
}

# Step 3: Clean Up Test HTML Files
Write-Host "`n[Step 3] Removing test HTML files..." -ForegroundColor Green

$testFilesToRemove = @(
    "src\basic-test.html",
    "src\module-test.html",
    "src\responsive-test.html"
)

foreach ($file in $testFilesToRemove) {
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "  Removed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "  Already removed: $file" -ForegroundColor Gray
    }
}

# Step 4: Update Server Package.json
Write-Host "`n[Step 4] Updating server package.json..." -ForegroundColor Green

$serverPackagePath = Join-Path -Path $PSScriptRoot -ChildPath "server\package.json"
if (Test-Path $serverPackagePath) {
    $packageJson = Get-Content -Path $serverPackagePath -Raw | ConvertFrom-Json
    
    # Update main entry point
    if ($packageJson.main -eq "index.js") {
        $packageJson.main = "index.ts"
        Write-Host "  Updated main entry point to index.ts" -ForegroundColor Yellow
    }
    
    # Update scripts
    $scriptsUpdated = $false
    if ($packageJson.scripts.start -eq "node index.js") {
        $packageJson.scripts.start = "node --loader ts-node/esm index.ts"
        $scriptsUpdated = $true
    }
    if ($packageJson.scripts.dev -eq "node --watch index.js") {
        $packageJson.scripts.dev = "node --loader ts-node/esm --watch index.ts"
        $scriptsUpdated = $true
    }
    
    if ($scriptsUpdated) {
        Write-Host "  Updated scripts to use TypeScript" -ForegroundColor Yellow
    } else {
        Write-Host "  Scripts already using TypeScript" -ForegroundColor Gray
    }
    
    # Add devDependencies if needed
    if (-not $packageJson.devDependencies -or -not $packageJson.devDependencies.'ts-node') {
        if (-not $packageJson.devDependencies) {
            $packageJson | Add-Member -NotePropertyName "devDependencies" -NotePropertyValue @{}
        }
        $packageJson.devDependencies | Add-Member -NotePropertyName "ts-node" -NotePropertyValue "^10.9.1" -Force
        $packageJson.devDependencies | Add-Member -NotePropertyName "typescript" -NotePropertyValue "^5.8.3" -Force
        Write-Host "  Added ts-node and typescript dev dependencies" -ForegroundColor Yellow
    }
    
    # Save updated package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path $serverPackagePath
    Write-Host "  Updated server package.json" -ForegroundColor Yellow
} else {
    Write-Host "  server/package.json not found" -ForegroundColor Red
}

# Step 4b: Update vite.config.js
Write-Host "`n[Step 4b] Updating vite.config.js..." -ForegroundColor Green

$viteConfigPath = Join-Path -Path $PSScriptRoot -ChildPath "vite.config.js"
if (Test-Path $viteConfigPath) {
    $content = Get-Content -Path $viteConfigPath -Raw
    
    # Check if @shared alias needs to be replaced with @server
    if ($content -match "@shared': resolve\(__dirname, 'shared'\)") {
        $updatedContent = $content -replace "@shared': resolve\(__dirname, 'shared'\)", "@server': resolve(__dirname, 'server')"
        Set-Content -Path $viteConfigPath -Value $updatedContent
        Write-Host "  Updated aliases in vite.config.js" -ForegroundColor Yellow
    } else {
        Write-Host "  Aliases in vite.config.js already correct" -ForegroundColor Gray
    }
} else {
    Write-Host "  vite.config.js not found" -ForegroundColor Red
}

Write-Host "`nCleanup completed successfully!" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "1. Run 'npm install' to install new dependencies"
Write-Host "2. Test the application with 'npm run dev'"
Write-Host "3. Test the server with 'cd server && npm run dev'"
