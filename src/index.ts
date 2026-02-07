/**
 * Stacks Builder Agent - Main Entry Point
 * 
 * This agent automates GitHub and onchain activity for the Stacks Builder Challenge.
 */

import { STACKS_CONFIG, SCHEDULE } from './config.js';

console.log('='.repeat(60));
console.log('🚀 Stacks Builder Agent');
console.log('='.repeat(60));
console.log(`Network: ${STACKS_CONFIG.network}`);
console.log(`Address: ${STACKS_CONFIG.address}`);
console.log(`Commits per run: ${SCHEDULE.commitsPerRun.min}-${SCHEDULE.commitsPerRun.max}`);
console.log(`Transactions per run: ${SCHEDULE.txPerRun.min}-${SCHEDULE.txPerRun.max}`);
console.log('='.repeat(60));

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'github':
      console.log('Running GitHub bot...');
      const { runGitHubBot } = await import('../scripts/github-bot.js');
      await runGitHubBot();
      break;
    
    case 'onchain':
      console.log('Running Onchain bot...');
      const { runOnchainBot } = await import('../scripts/onchain-bot.js');
      await runOnchainBot();
      break;
    
    case 'progress':
      console.log('Checking progress...');
      const { checkProgress } = await import('../scripts/progress-tracker.js');
      await checkProgress();
      break;
    
    case 'daily':
      console.log('Running full daily routine...');
      const github = await import('../scripts/github-bot.js');
      const onchain = await import('../scripts/onchain-bot.js');
      const progress = await import('../scripts/progress-tracker.js');
      
      await github.runGitHubBot();
      await onchain.runOnchainBot();
      await progress.checkProgress();
      break;
    
    case 'help':
    default:
      console.log(`
Usage: npm start [command]

Commands:
  github    Run GitHub bot (commits to repositories)
  onchain   Run Onchain bot (contract interactions)
  progress  Check Talent Protocol progress
  daily     Run full daily routine (all bots)
  help      Show this help message

Examples:
  npm start github
  npm start onchain
  npm start daily
      `);
  }
}

main().catch(console.error);
