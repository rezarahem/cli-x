#!/usr/bin/env node

import inquirer from 'inquirer';
import { Command } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import ora from 'ora';

const program = new Command();

program
  .name('rahem-cli-x')
  .description('CLI to clone and configure a Next.js app');

program
  .argument('<directory>', 'Directory to clone the Next.js app')
  .action(async directory => {
    if (directory === '.') {
      directory = process.cwd();
      if (fs.existsSync(path.join(directory, '.git'))) {
        console.log(
          `The current directory is already a Git repository. Aborting the process.`
        );
        process.exit(1);
      }
    } else {
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

    // Step 1: Cloning the repository
    const cloneSpinner = ora('Cloning repository...').start();
    try {
      execSync(
        `git clone https://github.com/rezarahem/ecom-cli-x ${directory}`,
        {
          stdio: 'inherit',
        }
      );
      cloneSpinner.succeed(`Repository cloned successfully to ${directory}`);
    } catch (error) {
      cloneSpinner.fail('Failed to clone the repository');
      process.exit(1);
    }

    // Step 2: Updating metadata title
    const updateSpinner = ora('Updating metadata title...').start();
    try {
      const layoutFilePath = path.join(directory, 'app/layout.tsx');
      if (!fs.existsSync(layoutFilePath)) {
        console.error(`Error: layout.tsx not found in ${layoutFilePath}`);
        process.exit(1);
      }
      const layoutContent = fs.readFileSync(layoutFilePath, 'utf-8');
      const updatedContent = layoutContent.replace(
        /title: "(.*?)"/,
        `title: "${title}"`
      );
      fs.writeFileSync(layoutFilePath, updatedContent, 'utf-8');
      updateSpinner.succeed(
        `Successfully updated the title to "${title}" in ${layoutFilePath}`
      );
    } catch (error) {
      updateSpinner.fail('Failed to update the title');
      process.exit(1);
    }

    // Step 3: Installing dependencies and creating .env file
    const installSpinner = ora('Installing dependencies...').start();
    try {
      execSync(`npm install`, { cwd: directory, stdio: 'inherit' });
      installSpinner.succeed('Dependencies installed successfully!');

      const envPath = path.join(directory, '.env');
      if (!fs.existsSync(envPath)) {
        const envContent = '# Add your environment variables here';
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('.env file created!');
      }
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      process.exit(1);
    }

    console.log('Next.js app setup is complete!');
  });

program.parse();
