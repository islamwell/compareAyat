import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function fixContrast(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text-gray-400 dark:text-gray-600 (bad in both) with text-gray-600 dark:text-gray-400
  content = content.replace(/text-gray-400 dark:text-gray-600/g, 'text-gray-600 dark:text-gray-400');
  
  // Replace text-gray-500 dark:text-gray-400 (okay, but bump to 600/300)
  content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-gray-600 dark:text-gray-300');
  
  // Replace text-gray-500 dark:text-gray-500
  content = content.replace(/text-gray-500 dark:text-gray-500/g, 'text-gray-700 dark:text-gray-300');

  // Any remaining text-gray-400 that isn't part of a dark: class should probably be text-gray-600
  // e.g. class="text-gray-400"
  // We have to be careful with regex so we don't match dark:text-gray-400
  content = content.replace(/(?<!dark:)text-gray-400/g, 'text-gray-600');
  content = content.replace(/(?<!dark:)text-gray-500/g, 'text-gray-700');
  content = content.replace(/(?<!dark:)text-gray-300/g, 'text-gray-500');

  // Bump dark mode contrasts
  content = content.replace(/dark:text-gray-600/g, 'dark:text-gray-400');
  content = content.replace(/dark:text-gray-500/g, 'dark:text-gray-300');

  fs.writeFileSync(filePath, content);
}

walkDir('./src', fixContrast);
console.log('Contrast fixes applied.');
