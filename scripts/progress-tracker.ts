/**
 * Progress Tracker - Monitor Talent Protocol Builder Score
 */

import { STACKS_CONFIG } from '../src/config.js';

interface TransactionSummary {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  contractCalls: number;
}

interface GitHubStats {
  repos: number;
  commits: number;
  lastCommit: string | null;
}

/**
 * Fetch recent transactions from Stacks API
 */
async function getRecentTransactions(address: string, limit: number = 50): Promise<TransactionSummary> {
  try {
    const response = await fetch(
      `${STACKS_CONFIG.apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}`
    );
    const data = await response.json();
    
    const results = data.results || [];
    
    const summary: TransactionSummary = {
      total: results.length,
      successful: 0,
      failed: 0,
      pending: 0,
      contractCalls: 0,
    };
    
    for (const tx of results) {
      if (tx.tx_status === 'success') {
        summary.successful++;
      } else if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
        summary.failed++;
      } else {
        summary.pending++;
      }
      
      if (tx.tx_type === 'contract_call') {
        summary.contractCalls++;
      }
    }
    
    return summary;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { total: 0, successful: 0, failed: 0, pending: 0, contractCalls: 0 };
  }
}

/**
 * Fetch GitHub activity stats
 */
async function getGitHubStats(username: string): Promise<GitHubStats> {
  try {
    // Get repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    );
    const repos = await reposResponse.json();
    
    // Get recent events
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events?per_page=100`
    );
    const events = await eventsResponse.json();
    
    // Count push events (commits)
    const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
    const totalCommits = pushEvents.reduce((acc: number, e: any) => {
      return acc + (e.payload?.commits?.length || 0);
    }, 0);
    
    // Find last commit
    const lastPush = pushEvents[0];
    const lastCommit = lastPush ? lastPush.created_at : null;
    
    return {
      repos: Array.isArray(repos) ? repos.length : 0,
      commits: totalCommits,
      lastCommit,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return { repos: 0, commits: 0, lastCommit: null };
  }
}

/**
 * Fetch STX balance
 */
async function getSTXBalance(address: string): Promise<{ balance: bigint; locked: bigint }> {
  try {
    const response = await fetch(
      `${STACKS_CONFIG.apiUrl}/extended/v1/address/${address}/stx`
    );
    const data = await response.json();
    
    return {
      balance: BigInt(data.balance || 0),
      locked: BigInt(data.locked || 0),
    };
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return { balance: BigInt(0), locked: BigInt(0) };
  }
}

/**
 * Calculate estimated Builder Score components
 */
function estimateBuilderScore(
  txSummary: TransactionSummary,
  githubStats: GitHubStats
): { estimated: number; breakdown: Record<string, number> } {
  // This is a rough estimation based on Talent Protocol's scoring system
  // Actual scores use proprietary multipliers
  
  const breakdown: Record<string, number> = {
    onchainActivity: Math.min(40, txSummary.contractCalls * 2),
    successRate: txSummary.total > 0 
      ? Math.min(20, (txSummary.successful / txSummary.total) * 20)
      : 0,
    githubRepos: Math.min(15, githubStats.repos * 1),
    recentCommits: Math.min(25, githubStats.commits * 0.5),
  };
  
  const estimated = Object.values(breakdown).reduce((a, b) => a + b, 0);
  
  return { estimated: Math.min(100, estimated), breakdown };
}

/**
 * Display progress bar
 */
function progressBar(value: number, max: number, width: number = 30): string {
  const percentage = Math.min(1, value / max);
  const filled = Math.round(width * percentage);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.round(percentage * 100)}%`;
}

/**
 * Main progress check function
 */
export async function checkProgress(): Promise<void> {
  console.log('='.repeat(60));
  console.log('📊 Builder Progress Check');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Address: ${STACKS_CONFIG.address}`);
  
  // Fetch all data in parallel
  const [txSummary, githubStats, balance] = await Promise.all([
    getRecentTransactions(STACKS_CONFIG.address),
    getGitHubStats('serayd61'),
    getSTXBalance(STACKS_CONFIG.address),
  ]);
  
  // Display STX Balance
  console.log('\n💰 STX Balance');
  console.log('-'.repeat(40));
  console.log(`  Available: ${Number(balance.balance) / 1_000_000} STX`);
  console.log(`  Locked:    ${Number(balance.locked) / 1_000_000} STX`);
  
  // Display Onchain Activity
  console.log('\n⛓️  Onchain Activity (Last 50 txs)');
  console.log('-'.repeat(40));
  console.log(`  Total:          ${txSummary.total}`);
  console.log(`  Successful:     ${txSummary.successful}`);
  console.log(`  Failed:         ${txSummary.failed}`);
  console.log(`  Pending:        ${txSummary.pending}`);
  console.log(`  Contract Calls: ${txSummary.contractCalls}`);
  console.log(`  Success Rate:   ${progressBar(txSummary.successful, txSummary.total || 1)}`);
  
  // Display GitHub Activity
  console.log('\n🐙 GitHub Activity');
  console.log('-'.repeat(40));
  console.log(`  Repositories:   ${githubStats.repos}`);
  console.log(`  Recent Commits: ${githubStats.commits}`);
  console.log(`  Last Commit:    ${githubStats.lastCommit || 'Unknown'}`);
  
  // Display Estimated Score
  const { estimated, breakdown } = estimateBuilderScore(txSummary, githubStats);
  
  console.log('\n🏆 Estimated Builder Score');
  console.log('-'.repeat(40));
  console.log(`  Overall: ${progressBar(estimated, 100)}`);
  console.log('\n  Breakdown:');
  for (const [key, value] of Object.entries(breakdown)) {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    console.log(`    ${label.padEnd(20)}: ${value.toFixed(1)} pts`);
  }
  
  // Recommendations
  console.log('\n💡 Recommendations');
  console.log('-'.repeat(40));
  
  if (txSummary.contractCalls < 10) {
    console.log('  • Increase contract interactions (currently: ' + txSummary.contractCalls + ')');
  }
  if (githubStats.commits < 20) {
    console.log('  • Push more commits (recent: ' + githubStats.commits + ')');
  }
  if (txSummary.failed > 0) {
    console.log('  • Fix failing transactions (' + txSummary.failed + ' failed)');
  }
  if (balance.balance < BigInt(100_000)) {
    console.log('  • Low STX balance - add more for gas fees');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔗 Links');
  console.log('='.repeat(60));
  console.log(`  Explorer: ${STACKS_CONFIG.explorerUrl}/address/${STACKS_CONFIG.address}?chain=mainnet`);
  console.log(`  Talent:   https://talent.app/~/earn/stacks-builder-rewards-feb`);
  console.log(`  GitHub:   https://github.com/serayd61`);
  console.log('='.repeat(60));
}

// Run if called directly
if (process.argv[1]?.includes('progress-tracker')) {
  checkProgress().catch(console.error);
}

export default { checkProgress };
