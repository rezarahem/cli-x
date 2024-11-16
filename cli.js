#!/usr/bin/env node

import inquirer from 'inquirer';
import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('rahem-cli-x')
  .description('CLI to clone and configure a Next.js app')
  .version('0.0.1');

program
  .argument('<directory>', 'Directory to clone the Next.js app')
  .action(async directory => {
    // If the directory is '.' (current directory), use the current working directory
    if (directory === '.') {
      directory = process.cwd();
    } else {
      // Otherwise, create the directory if it does not exist
      const targetDir = path.join(process.cwd(), directory);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      directory = targetDir;
    }

    // Prompt the user for the title
    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What should be the title in layout.tsx?',
        default: 'Default Title',
      },
    ]);

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
