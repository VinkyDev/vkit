/* eslint-disable */
import { execSync } from 'child_process';
import { cpSync, rmSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const reactDist = path.resolve('apps/react/dist');
const electronDistTarget = path.resolve('apps/electron/out/renderer');
const featuresSource = path.resolve('features');
const featuresTarget = path.resolve('apps/electron/out/features');

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
  step('Building Features packages');
  run('pnpm build:features');
  log('Features packages built.');

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

  step('Copying features to Electron output');
  if (existsSync(featuresTarget)) {
    rmSync(featuresTarget, { recursive: true, force: true });
    log(`Cleaned old features dist at ${featuresTarget}`);
  }

  if (existsSync(featuresSource)) {
    const features = readdirSync(featuresSource, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const featureId of features) {
      const featureDist = path.resolve(featuresSource, featureId, 'dist');
      const featureTarget = path.resolve(featuresTarget, featureId);
      
      if (existsSync(featureDist)) {
        cpSync(featureDist, featureTarget, { recursive: true });
        log(`Copied feature '${featureId}' to ${featureTarget}`);
      } else {
        console.warn(`⚠️  Feature '${featureId}' dist not found at ${featureDist}`);
      }
    }
    log('Features copied to Electron output.');
  }

  log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error.message);
  process.exit(1);
}
