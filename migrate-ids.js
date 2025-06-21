#!/usr/bin/env node

/**
 * Automated Migration Script for Ascend Avoid
 * Converts all ID-based selectors to class/data attribute selectors
 * 
 * Usage: node migrate-ids.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Migration mapping for your specific IDs
const ID_MIGRATION_MAP = new Map([
  // Canvas
  ['canvas', {
    className: 'game-canvas',
    dataAttribute: 'data-canvas="primary"',
    selector: '.game-canvas[data-canvas="primary"]'
  }],
  
  // Headers and scores
  ['headers', {
    className: 'score-panel',
    dataAttribute: 'data-scores="main"',
    selector: '.score-panel[data-scores="main"]'
  }],
  ['highScore', {
    className: 'score-value',
    dataAttribute: 'data-score="high"',
    selector: '.score-value[data-score="high"]'
  }],
  ['score', {
    className: 'score-value',
    dataAttribute: 'data-score="current"',
    selector: '.score-value[data-score="current"]'
  }],
  
  // Layout containers
  ['game-layout', {
    className: 'game-area',
    dataAttribute: 'data-section="game"',
    selector: '.game-area[data-section="game"]'
  }],
  ['game-container', {
    className: 'canvas-viewport',
    dataAttribute: 'data-viewport="main"',
    selector: '.canvas-viewport[data-viewport="main"]'
  }],
  ['wrapper', {
    className: 'app-root',
    dataAttribute: 'data-app="ascend-avoid"',
    selector: '.app-root[data-app="ascend-avoid"]'
  }],
  
  // Sidebar
  ['desktop-sidebar', {
    className: 'info-panel',
    dataAttribute: 'data-panel="info"',
    selector: '.info-panel[data-panel="info"]'
  }],
  ['instructions-desktop', {
    className: 'panel-content',
    dataAttribute: 'data-content="instructions"',
    selector: '.panel-content[data-content="instructions"]'
  }],
  
  // Mobile elements
  ['floating-menu', {
    className: 'float-menu',
    dataAttribute: 'data-menu="primary"',
    selector: '.float-menu[data-menu="primary"]'
  }],
  ['floating-menu-button', {
    className: 'float-trigger',
    dataAttribute: 'data-trigger="menu"',
    selector: '.float-trigger[data-trigger="menu"]'
  }],
  ['floating-menu-items', {
    className: 'float-options',
    dataAttribute: 'data-options="menu"',
    selector: '.float-options[data-options="menu"]'
  }],
  
  // UI elements
  ['guide-button', {
    className: 'btn-action',
    dataAttribute: 'data-action="guide"',
    selector: '.btn-action[data-action="guide"]'
  }],
  ['multiplayer-toggle', {
    className: 'btn-action',
    dataAttribute: 'data-action="multiplayer"',
    selector: '.btn-action[data-action="multiplayer"]'
  }],
  ['instructions-modal', {
    className: 'modal-panel',
    dataAttribute: 'data-modal="instructions"',
    selector: '.modal-panel[data-modal="instructions"]'
  }],
  
  // Touch controls
  ['touch-controls-container', {
    className: 'touch-controller',
    dataAttribute: 'data-controller="main"',
    selector: '.touch-controller[data-controller="main"]'
  }],
  ['game-ui-container', {
    className: 'control-panel',
    dataAttribute: 'data-section="controls"',
    selector: '.control-panel[data-section="controls"]'
  }],
  
  // Error handling
  ['error-container', {
    className: 'error-panel',
    dataAttribute: 'data-error="container"',
    selector: '.error-panel[data-error="container"]'
  }],
  ['error-message', {
    className: 'error-text',
    dataAttribute: 'data-error="message"',
    selector: '.error-text[data-error="message"]'
  }]
]);

class IDMigrationTool {
  constructor() {
    this.fileCount = 0;
    this.changeCount = 0;
    this.errors = [];
    this.backupDir = './backup-before-migration';
  }

  async run() {
    console.log('🚀 Starting Ascend Avoid ID Migration...\n');
    
    // Create backup directory
    await this.createBackup();
    
    // Process all file types
    await this.processDirectory('./src', ['.ts', '.tsx', '.js', '.jsx']);
    await this.processDirectory('./', ['.html']);
    await this.processDirectory('./src/styles', ['.css']);
    await this.processDirectory('./styles', ['.css']);
    
    // Generate report
    this.generateReport();
  }

  async createBackup() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}\n`);
    }
  }

  async processDirectory(dir, extensions) {
    try {
      const files = await this.getFiles(dir, extensions);
      
      for (const file of files) {
        await this.processFile(file);
      }
    } catch (error) {
      console.error(`Error processing directory ${dir}:`, error);
    }
  }

  async getFiles(dir, extensions) {
    const results = [];
    
    try {
      const items = await readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemStat = await stat(fullPath);
        
        if (itemStat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
          const subFiles = await this.getFiles(fullPath, extensions);
          results.push(...subFiles);
        } else if (itemStat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return results;
  }

  async processFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const ext = path.extname(filePath);
      let newContent = content;
      
      // Backup original file
      const backupPath = path.join(this.backupDir, path.basename(filePath));
      await writeFile(backupPath, content);
      
      // Process based on file type
      switch (ext) {
        case '.html':
          newContent = this.processHTML(content);
          break;
        case '.css':
          newContent = this.processCSS(content);
          break;
        case '.ts':
        case '.tsx':
        case '.js':
        case '.jsx':
          newContent = this.processJavaScript(content);
          break;
      }
      
      // Write updated content if changed
      if (newContent !== content) {
        await writeFile(filePath, newContent);
        this.fileCount++;
        console.log(`✅ Updated: ${filePath}`);
      }
      
    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error}`);
    }
  }

  processHTML(content) {
    let updated = content;
    let changes = 0;
    
    ID_MIGRATION_MAP.forEach((mapping, id) => {
      // Replace id="..." with class and data attribute
      const idRegex = new RegExp(`id=["']${id}["']`, 'g');
      const replacement = `class="${mapping.className}" ${mapping.dataAttribute}`;
      
      const matches = updated.match(idRegex);
      if (matches) {
        changes += matches.length;
        updated = updated.replace(idRegex, replacement);
      }
    });
    
    // Update getElementById calls in inline scripts
    ID_MIGRATION_MAP.forEach((mapping, id) => {
      const getByIdRegex = new RegExp(`getElementById\\(['"\`]${id}['"\`]\\)`, 'g');
      const replacement = `querySelector('${mapping.selector}')`;
      
      const matches = updated.match(getByIdRegex);
      if (matches) {
        changes += matches.length;
        updated = updated.replace(getByIdRegex, replacement);
      }
    });
    
    this.changeCount += changes;
    return updated;
  }

  processCSS(content) {
    let updated = content;
    let changes = 0;
    
    ID_MIGRATION_MAP.forEach((mapping, id) => {
      // Replace #id selectors
      const idRegex = new RegExp(`#${id}(?=[\\s{,:])`, 'g');
      
      const matches = updated.match(idRegex);
      if (matches) {
        changes += matches.length;
        updated = updated.replace(idRegex, mapping.selector);
      }
    });
    
    this.changeCount += changes;
    return updated;
  }

  processJavaScript(content) {
    let updated = content;
    let changes = 0;
    
    ID_MIGRATION_MAP.forEach((mapping, id) => {
      // Replace getElementById
      const getByIdRegex = new RegExp(`document\\.getElementById\\(\\s*['"\`]${id}['"\`]\\s*\\)`, 'g');
      const replacement = `document.querySelector('${mapping.selector}')`;
      
      const matches = updated.match(getByIdRegex);
      if (matches) {
        changes += matches.length;
        updated = updated.replace(getByIdRegex, replacement);
      }
      
      // Replace querySelector with ID
      const querySelectorRegex = new RegExp(`querySelector\\(\\s*['"\`]#${id}['"\`]\\s*\\)`, 'g');
      const replacement2 = `querySelector('${mapping.selector}')`;
      
      const matches2 = updated.match(querySelectorRegex);
      if (matches2) {
        changes += matches2.length;
        updated = updated.replace(querySelectorRegex, replacement2);
      }
      
      // Replace querySelectorAll with ID
      const querySelectorAllRegex = new RegExp(`querySelectorAll\\(\\s*['"\`]#${id}['"\`]\\s*\\)`, 'g');
      const replacement3 = `querySelectorAll('${mapping.selector}')`;
      
      const matches3 = updated.match(querySelectorAllRegex);
      if (matches3) {
        changes += matches3.length;
        updated = updated.replace(querySelectorAllRegex, replacement3);
      }
    });
    
    this.changeCount += changes;
    return updated;
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Files updated: ${this.fileCount}`);
    console.log(`✅ Total changes: ${this.changeCount}`);
    console.log(`📁 Backup location: ${this.backupDir}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Review the changes in your files');
    console.log('2. Test the game thoroughly');
    console.log('3. Run: npm run lint to check for issues');
    console.log('4. If everything works, delete the backup folder');
    console.log('5. Commit your changes');
    
    console.log('\n✨ Migration complete!');
  }
}

// Run the migration
if (require.main === module) {
  const migrationTool = new IDMigrationTool();
  migrationTool.run().catch(console.error);
}

module.exports = IDMigrationTool;
