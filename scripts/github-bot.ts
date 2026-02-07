/**
 * GitHub Bot - Automated commit generation
 * Works both locally and in CI (GitHub Actions)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { SCHEDULE } from '../src/config.js';
import { generateCommitMessage, generateCodeContent } from './content-generator.js';

// Repositories to commit to (using GitHub URLs for CI compatibility)
const TARGET_REPOS = [
  { owner: 'serayd61', name: 'stacks-defi-sentinel', types: ['feature', 'docs', 'test', 'refactor'] },
  { owner: 'serayd61', name: 'stx-escrow', types: ['feature', 'docs', 'test'] },
  { owner: 'serayd61', name: 'stacks-utils', types: ['feature', 'docs', 'test', 'refactor'] },
  { owner: 'serayd61', name: 'stacks-builder-agent', types: ['feature', 'docs', 'ci', 'refactor'] },
  { owner: 'serayd61', name: 'stacks-analytics', types: ['feature', 'docs', 'test'] },
  { owner: 'serayd61', name: 'clarity-patterns', types: ['feature', 'docs', 'test'] },
  { owner: 'serayd61', name: 'stacks-testing-suite', types: ['feature', 'docs', 'test'] },
];

interface RepoInfo {
  owner: string;
  name: string;
  types: string[];
}

/**
 * Execute shell command
 */
function exec(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    }).trim();
  } catch (error: any) {
    console.error(`  Command failed: ${command}`);
    console.error(`  Error: ${error.message?.substring(0, 200)}`);
    return '';
  }
}

/**
 * Clone or update a repository into a temp directory
 */
function cloneRepo(repo: RepoInfo, workDir: string): string | null {
  const repoDir = path.join(workDir, repo.name);
  const ghToken = process.env.GH_PAT || process.env.GITHUB_TOKEN || '';
  
  const repoUrl = ghToken 
    ? `https://x-access-token:${ghToken}@github.com/${repo.owner}/${repo.name}.git`
    : `https://github.com/${repo.owner}/${repo.name}.git`;
  
  try {
    if (fs.existsSync(repoDir)) {
      console.log(`  Pulling latest for ${repo.name}...`);
      exec('git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true', repoDir);
    } else {
      console.log(`  Cloning ${repo.owner}/${repo.name}...`);
      exec(`git clone --depth 1 ${repoUrl} ${repoDir}`);
    }
    
    // Configure git
    exec('git config user.name "serayd61"', repoDir);
    exec('git config user.email "agent@stacks-builder.dev"', repoDir);
    
    return repoDir;
  } catch (error: any) {
    console.error(`  Failed to clone ${repo.name}: ${error.message}`);
    return null;
  }
}

/**
 * Create file and commit to repo
 */
function commitToRepo(repoDir: string, repo: RepoInfo, commitType: string): boolean {
  console.log(`\n  Committing to ${repo.name} (${commitType})...`);
  
  // Generate content
  const { filename, content } = generateCodeContent(commitType);
  const filePath = path.join(repoDir, filename);
  
  // Ensure directory exists
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  
  // Write or append to file
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, '\n' + content);
  } else {
    fs.writeFileSync(filePath, content);
  }
  
  // Stage changes
  exec(`git add -A`, repoDir);
  
  // Check for changes
  const status = exec('git status --porcelain', repoDir);
  if (!status) {
    console.log(`  No changes to commit`);
    return false;
  }
  
  // Generate commit message
  const message = generateCommitMessage(commitType);
  
  // Commit
  const commitResult = exec(`git commit -m "${message}"`, repoDir);
  if (!commitResult) {
    console.log(`  Failed to commit`);
    return false;
  }
  
  console.log(`  Committed: ${message}`);
  
  // Push
  const pushResult = exec('git push origin main 2>&1 || git push origin master 2>&1', repoDir);
  if (pushResult.includes('error') || pushResult.includes('fatal')) {
    console.log(`  Push may have failed: ${pushResult.substring(0, 100)}`);
    return false;
  }
  
  console.log(`  Pushed successfully`);
  return true;
}

/**
 * Get random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Main GitHub bot function
 */
export async function runGitHubBot(): Promise<void> {
  console.log('='.repeat(60));
  console.log('GitHub Bot Starting');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Create temp work directory
  const workDir = path.join(process.env.RUNNER_TEMP || '/tmp', 'stacks-repos');
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }
  console.log(`Work directory: ${workDir}`);
  
  // Determine commit count and types
  const commitCount = randomBetween(SCHEDULE.commitsPerRun.min, SCHEDULE.commitsPerRun.max);
  const dayOfWeek = new Date().getDay();
  const commitTypes = ['docs', 'test', 'feature', 'fix', 'refactor', 'ci', 'docs'];
  const primaryType = commitTypes[dayOfWeek];
  
  console.log(`Target commits: ${commitCount}`);
  console.log(`Primary type: ${primaryType}`);
  
  // Select random repos
  const shuffled = [...TARGET_REPOS].sort(() => Math.random() - 0.5);
  const selectedRepos = shuffled.slice(0, commitCount);
  
  console.log(`Selected repos: ${selectedRepos.map(r => r.name).join(', ')}`);
  
  let successCount = 0;
  
  for (const repo of selectedRepos) {
    console.log(`\nProcessing ${repo.name}...`);
    
    // Clone or update repo
    const repoDir = cloneRepo(repo, workDir);
    if (!repoDir) {
      console.log(`  Skipping - clone failed`);
      continue;
    }
    
    // Choose commit type
    const type = repo.types.includes(primaryType)
      ? primaryType
      : repo.types[Math.floor(Math.random() * repo.types.length)];
    
    // Commit
    if (commitToRepo(repoDir, repo, type)) {
      successCount++;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`GitHub Bot Complete`);
  console.log(`Successful commits: ${successCount}/${commitCount}`);
  console.log('='.repeat(60));
}

// Run if called directly
if (process.argv[1]?.includes('github-bot')) {
  runGitHubBot().catch(console.error);
}

export default { runGitHubBot };
