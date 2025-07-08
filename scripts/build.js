/* eslint-disable */
import { execSync } from 'child_process';
import { cpSync, rmSync, existsSync } from 'fs';
import path from 'path';

const reactDist = path.resolve('apps/react/dist');
const electronDistTarget = path.resolve('apps/electron/out/renderer');

function log(message) {
  console.log(`\n✅ ${message}`);
}

function step(message) {
  console.log(`\n🚀 ${message}`);
}

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

try {
  step('Building React application');
  run('pnpm build:react');
  log('React application built.');

  if (!existsSync(reactDist)) {
    throw new Error(`React dist folder not found at ${reactDist}`);
  }

  step('Preparing Electron application package');
  if (existsSync(electronDistTarget)) {
    rmSync(electronDistTarget, { recursive: true, force: true });
    log(`Cleaned old electron renderer dist at ${electronDistTarget}`);
  }

  cpSync(reactDist, electronDistTarget, { recursive: true });
  log(`Copied React build to ${electronDistTarget}`);

  step('Building Electron application');
  run('pnpm build:electron');
  log('Electron application built.');

  log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error.message);
  process.exit(1);
}
