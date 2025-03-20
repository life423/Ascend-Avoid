#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { minify } = require('terser');

console.log('===================================================');
console.log('  Cross the Box Game - Production Build Script     ');
console.log('===================================================');
console.log('');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Function to minify JavaScript
async function minifyJS(filePath, outputPath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await minify(code, {
      compress: true,
      mangle: true
    });
    fs.writeFileSync(outputPath, result.code);
    console.log(`✅ Minified ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Failed to minify ${path.basename(filePath)}:`, error.message);
    // Fallback to copy the original file
    fs.copyFileSync(filePath, outputPath);
    console.log(`ℹ️ Copied original ${path.basename(filePath)} as fallback`);
  }
}

// Copy HTML file
try {
  fs.copyFileSync(
    path.join(__dirname, 'index.html'),
    path.join(buildDir, 'index.html')
  );
  console.log('✅ Copied index.html');
} catch (error) {
  console.error('❌ Failed to copy index.html:', error.message);
}

// Copy and minify JavaScript
minifyJS(
  path.join(__dirname, 'app.js'),
  path.join(buildDir, 'app.min.js')
).then(() => {
  // Fix the script reference in HTML
  try {
    const htmlPath = path.join(buildDir, 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace(
      /<script src\s*=\s*["']app\.js["']\s*><\/script>/,
      '<script src="app.min.js"></script>'
    );
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ Updated script reference in index.html');
  } catch (error) {
    console.error('❌ Failed to update script reference:', error.message);
  }
});

// Copy and minify CSS
try {
  const cssInput = path.join(__dirname, 'style.css');
  const cssOutput = path.join(buildDir, 'style.min.css');
  
  let cssContent = fs.readFileSync(cssInput, 'utf8');
  
  // Simple CSS minification
  cssContent = cssContent
    .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '') // Remove comments and whitespace
    .replace(/ {2,}/g, ' ')                              // Remove multiple spaces
    .replace(/: /g, ':')                                 // Remove space after colons
    .replace(/ \{/g, '{')                               // Remove space before opening braces
    .replace(/\} /g, '}')                               // Remove space after closing braces
    .replace(/; /g, ';')                                // Remove space after semicolons
    .replace(/,\s+/g, ',');                             // Remove space after commas
  
  fs.writeFileSync(cssOutput, cssContent);
  console.log('✅ Minified style.css');
  
  // Fix the CSS reference in HTML
  const htmlPath = path.join(buildDir, 'index.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  htmlContent = htmlContent.replace(
    /<link\s+rel="stylesheet"\s+href="style\.css">/,
    '<link rel="stylesheet" href="style.min.css">'
  );
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('✅ Updated CSS reference in index.html');
} catch (error) {
  console.error('❌ Failed to process CSS:', error.message);
  // Fallback to copy the original CSS
  try {
    fs.copyFileSync(
      path.join(__dirname, 'style.css'),
      path.join(buildDir, 'style.css')
    );
    console.log('ℹ️ Copied original style.css as fallback');
  } catch (err) {
    console.error('❌ Failed to copy style.css fallback:', err.message);
  }
}

// Copy images
try {
  fs.copyFileSync(
    path.join(__dirname, 'Game_Home.png'),
    path.join(buildDir, 'Game_Home.png')
  );
  console.log('✅ Copied Game_Home.png');
} catch (error) {
  console.error('❌ Failed to copy Game_Home.png:', error.message);
}

console.log('\n🎮 Production build completed!');
console.log('\nThe optimized files are in the dist/ directory.');
console.log('\nTo test the production build, run:');
console.log('  npx http-server dist -o -p 8080');
