#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minify } = require('terser');


// Source and build directories
const srcDir = path.join(__dirname, 'src');
const buildDir = path.join(__dirname, 'dist');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Function to recursively create directories
function createDirIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to minify JavaScript
async function minifyJS(filePath, outputPath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await minify(code, {
      compress: true,
      mangle: true,
      module: true // Handle ES modules
    });
    fs.writeFileSync(outputPath, result.code);
    console.log(`✅ Minified ${path.relative(__dirname, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to minify ${path.relative(__dirname, filePath)}:`, error.message);
    // Fallback to copy the original file
    fs.copyFileSync(filePath, outputPath);
    console.log(`ℹ️ Copied original ${path.relative(__dirname, filePath)} as fallback`);
    return false;
  }
}

// Function to minify CSS
function minifyCSS(filePath, outputPath) {
  try {
    let cssContent = fs.readFileSync(filePath, 'utf8');
    
    // Simple CSS minification
    cssContent = cssContent
      .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '') // Remove comments and whitespace
      .replace(/ {2,}/g, ' ')                              // Remove multiple spaces
      .replace(/: /g, ':')                                 // Remove space after colons
      .replace(/ \{/g, '{')                               // Remove space before opening braces
      .replace(/\} /g, '}')                               // Remove space after closing braces
      .replace(/; /g, ';')                                // Remove space after semicolons
      .replace(/,\s+/g, ',');                             // Remove space after commas
    
    fs.writeFileSync(outputPath, cssContent);
    console.log(`✅ Minified ${path.relative(__dirname, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to minify ${path.relative(__dirname, filePath)}:`, error.message);
    // Fallback to copy the original file
    fs.copyFileSync(filePath, outputPath);
    console.log(`ℹ️ Copied original ${path.relative(__dirname, filePath)} as fallback`);
    return false;
  }
}

// Copy HTML file
try {
  // Ensure index.html redirects to the game
  const buildIndexPath = path.join(buildDir, 'index.html');
  fs.copyFileSync(path.join(__dirname, 'index.html'), buildIndexPath);
  console.log('✅ Copied root index.html (redirects to game)');
  
  // Also copy the game's HTML file
  const gameHtmlPath = path.join(srcDir, 'index.html');
  const gameHtmlDestPath = path.join(buildDir, 'src', 'index.html');
  
  // Create the directory if it doesn't exist
  createDirIfNotExists(path.dirname(gameHtmlDestPath));
  
  fs.copyFileSync(gameHtmlPath, gameHtmlDestPath);
  console.log('✅ Copied src/index.html');
} catch (error) {
  console.error('❌ Failed to copy HTML:', error.message);
}

// Process JavaScript files
async function processJsFiles() {
  const jsDir = path.join(srcDir, 'js');
  const jsDirDest = path.join(buildDir, 'src', 'js');
  
  // Create the JS directory in dist
  createDirIfNotExists(jsDirDest);
  
  try {
    const jsFiles = fs.readdirSync(jsDir);
    
    // Process each JS file
    for (const file of jsFiles) {
      if (file.endsWith('.js')) {
        const sourcePath = path.join(jsDir, file);
        const destPath = path.join(jsDirDest, file);
        await minifyJS(sourcePath, destPath);
      }
    }
    
    console.log('✅ Processed all JavaScript files');
  } catch (error) {
    console.error('❌ Failed to process JS files:', error.message);
  }
}

// Process CSS files
function processCssFiles() {
  const cssDir = path.join(srcDir, 'styles');
  const cssDirDest = path.join(buildDir, 'src', 'styles');
  
  // Create the CSS directory in dist
  createDirIfNotExists(cssDirDest);
  
  try {
    const cssFiles = fs.readdirSync(cssDir);
    
    // Process each CSS file
    for (const file of cssFiles) {
      if (file.endsWith('.css')) {
        const sourcePath = path.join(cssDir, file);
        const destPath = path.join(cssDirDest, file);
        minifyCSS(sourcePath, destPath);
      }
    }
    
    console.log('✅ Processed all CSS files');
  } catch (error) {
    console.error('❌ Failed to process CSS files:', error.message);
  }
}

// Copy assets directory
function copyAssets() {
  const assetsDir = path.join(srcDir, 'assets');
  const assetsDirDest = path.join(buildDir, 'src', 'assets');
  
  // Create the assets directory in dist
  createDirIfNotExists(assetsDirDest);
  
  try {
    // Recursively copy all subdirectories and files
    function copyDirRecursive(src, dest) {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          createDirIfNotExists(destPath);
          copyDirRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    if (fs.existsSync(assetsDir)) {
      copyDirRecursive(assetsDir, assetsDirDest);
      console.log('✅ Copied assets directory');
    } else {
      console.log('ℹ️ No assets directory found');
    }
  } catch (error) {
    console.error('❌ Failed to copy assets:', error.message);
  }
}

// Run all build processes
async function buildAll() {
  try {
    await processJsFiles();
    processCssFiles();
    copyAssets();
    
    console.log('\n🎮 Production build completed!');
    console.log('\nThe optimized files are in the dist/ directory.');
    console.log('\nTo test the production build, run:');
    console.log('  npx http-server dist -o -p 8080');
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

// Start the build process
buildAll();
