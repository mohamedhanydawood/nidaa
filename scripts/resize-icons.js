#!/usr/bin/env node

/**
 * Icon Resizer Script
 * Resizes PNG icons to 256x256 for Linux builds
 * 
 * Usage: node scripts/resize-icons.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PNG manipulation using pure JavaScript
class PNGResizer {
  static async resizeToSquare(inputPath, outputPath, size = 256) {
    try {
      console.log(`📸 Reading: ${inputPath}`);
      
      // Check if input exists
      if (!existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      // For now, we'll use sharp package if available, or notify user
      const sharp = await import('sharp').catch(() => null);
      
      if (!sharp) {
        console.log('⚠️  Sharp package not found. Installing...');
        const { execSync } = await import('child_process');
        execSync('npm install --no-save sharp', { stdio: 'inherit' });
        
        // Re-import after installation
        const sharpModule = await import('sharp');
        return this.resizeWithSharp(sharpModule.default, inputPath, outputPath, size);
      }
      
      return this.resizeWithSharp(sharp.default, inputPath, outputPath, size);
      
    } catch (error) {
      console.error(`❌ Error processing ${inputPath}:`, error.message);
      throw error;
    }
  }

  static async resizeWithSharp(sharp, inputPath, outputPath, size) {
    console.log(`🔄 Resizing to ${size}x${size}...`);
    
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created: ${outputPath}`);
    return outputPath;
  }
}

// Main execution
async function main() {
  console.log('🎨 Icon Resizer for Linux Builds\n');
  
  const projectRoot = join(__dirname, '..');
  const iconsToResize = [
    {
      input: join(projectRoot, 'assets', 'icon.png'),
      output: join(projectRoot, 'assets', 'icon-256.png'),
      size: 256
    },
    {
      input: join(projectRoot, 'public', 'icon.png'),
      output: join(projectRoot, 'public', 'icon-256.png'),
      size: 256
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const icon of iconsToResize) {
    try {
      await PNGResizer.resizeToSquare(icon.input, icon.output, icon.size);
      successCount++;
    } catch (error) {
      console.error(`Failed to resize ${icon.input}`);
      failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${failCount} failed`);
  
  if (successCount > 0) {
    console.log('\n💡 Tip: Update package.json linux.icon to point to the resized icon');
  }
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
