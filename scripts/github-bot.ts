/**
 * GitHub Bot - Automated commit generation
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { REPOSITORIES, SCHEDULE } from '../src/config.js';
import { generateCommitBatch, generateCommitMessage, generateCodeContent } from './content-generator.js';

interface Repository {
  owner: string;
  name: string;
  path: string;
  types: string[];
}

/**
 * Execute git command in repository
 */
function git(repoPath: string, command: string): string {
  try {
    return execSync(`git ${command}`, {
      cwd: repoPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error: any) {
    console.error(`Git error in ${repoPath}: ${error.message}`);
    return '';
  }
}

/**
 * Check if repository exists locally
 */
function repoExists(repoPath: string): boolean {
  return fs.existsSync(path.join(repoPath, '.git'));
}

/**
 * Clone repository if not exists
 */
function ensureRepo(repo: Repository): boolean {
  if (repoExists(repo.path)) {
    console.log(`✓ Repository exists: ${repo.name}`);
    return true;
  }
  
  console.log(`Cloning ${repo.owner}/${repo.name}...`);
  try {
    const parentDir = path.dirname(repo.path);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    execSync(`git clone https://github.com/${repo.owner}/${repo.name}.git ${repo.path}`, {
      encoding: 'utf-8',
    });
    return true;
  } catch (error: any) {
    console.error(`Failed to clone ${repo.name}: ${error.message}`);
    return false;
  }
}

/**
 * Create and commit files to repository
 */
function commitToRepo(repo: Repository, type: string): boolean {
  if (!repoExists(repo.path)) {
    console.log(`Skipping ${repo.name} - not found locally`);
    return false;
  }
  
  console.log(`\nProcessing ${repo.name} (${type})...`);
  
  // Pull latest changes
  git(repo.path, 'pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true');
  
  // Generate content
  const { filename, content } = generateCodeContent(type);
  const filePath = path.join(repo.path, filename);
  
  // Ensure directory exists
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  
  // Write or append to file
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, content);
  } else {
    fs.writeFileSync(filePath, content);
  }
  
  // Stage changes
  git(repo.path, `add "${filename}"`);
  
  // Check if there are changes to commit
  const status = git(repo.path, 'status --porcelain');
  if (!status) {
    console.log(`  No changes to commit in ${repo.name}`);
    return false;
  }
  
  // Generate commit message
  const message = generateCommitMessage(type);
  
  // Commit
  const commitResult = git(repo.path, `commit -m "${message}"`);
  if (!commitResult) {
    console.log(`  Failed to commit in ${repo.name}`);
    return false;
  }
  
  console.log(`  ✓ Committed: ${message}`);
  
  // Push changes
  const pushResult = git(repo.path, 'push origin main 2>/dev/null || git push origin master 2>/dev/null');
  if (pushResult !== '') {
    console.log(`  ✓ Pushed to remote`);
  } else {
    console.log(`  ⚠ Push may have failed - check manually`);
  }
  
  return true;
}

/**
 * Get random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select random repositories
 */
function selectRandomRepos(count: number): Repository[] {
  const shuffled = [...REPOSITORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Main GitHub bot function
 */
export async function runGitHubBot(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🤖 GitHub Bot Starting');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Determine number of commits
  const commitCount = randomBetween(SCHEDULE.commitsPerRun.min, SCHEDULE.commitsPerRun.max);
  console.log(`Target commits: ${commitCount}`);
  
  // Select random repositories
  const selectedRepos = selectRandomRepos(commitCount);
  console.log(`Selected repos: ${selectedRepos.map(r => r.name).join(', ')}`);
  
  // Day-based commit types
  const dayOfWeek = new Date().getDay();
  const commitTypes = ['docs', 'test', 'feature', 'fix', 'refactor', 'ci', 'docs'];
  const primaryType = commitTypes[dayOfWeek];
  
  console.log(`\nPrimary commit type for today: ${primaryType}`);
  
  let successCount = 0;
  
  for (const repo of selectedRepos) {
    // Use primary type if repo supports it, otherwise random from repo's types
    const type = repo.types.includes(primaryType) 
      ? primaryType 
      : repo.types[Math.floor(Math.random() * repo.types.length)];
    
    if (commitToRepo(repo, type)) {
      successCount++;
    }
    
    // Small delay between repos
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ GitHub Bot Complete`);
  console.log(`   Successful commits: ${successCount}/${commitCount}`);
  console.log('='.repeat(60));
}

// Run if called directly
if (process.argv[1]?.includes('github-bot')) {
  runGitHubBot().catch(console.error);
}

export default { runGitHubBot };
