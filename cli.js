#!/usr/bin/env node

import { execSync } from 'child_process';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('ecom-cli')
  .description('CLI to clone and configure a Next.js app')
  .version('1.0.0');

program
  .argument('<directory>', 'Directory to clone the Next.js app')
  .option(
    '-t, --title <title>',
    'Title to update in layout.tsx',
    'Default Title'
  )
  .action((directory, options) => {
    const { title } = options;

    // Step 1: Clone the repository
    console.log('Cloning repository...');
    execSync(`git clone https://github.com/rezarahem/ecom-cli-x ${directory}`, {
      stdio: 'inherit',
    });

    const layoutFilePath = path.join(directory, 'app/layout.tsx');

    // Step 2: Check if layout.tsx exists
    if (!fs.existsSync(layoutFilePath)) {
      console.error(`Error: layout.tsx not found in ${layoutFilePath}`);
      process.exit(1);
    }

    // Step 3: Update the title in layout.tsx
    console.log('Updating metadata title...');
    const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8');

    const updatedContent = layoutContent.replace(
      /title: "(.*?)"/,
      `title: "${title}"`
    );

    fs.writeFileSync(layoutFilePath, updatedContent, 'utf-8');
    console.log(`Successfully updated the title to "${title}".`);

    // Step 4: Install dependencies
    console.log('Installing dependencies...');
    execSync(`npm install`, { cwd: directory, stdio: 'inherit' });

    console.log('Next.js app setup is complete!');
  });

program.parse();
