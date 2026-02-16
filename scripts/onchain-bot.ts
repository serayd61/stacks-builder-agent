/**
 * Onchain Bot - Automated Stacks mainnet transactions
 * Uses @stacks/transactions for building and broadcasting txs
 * 
 * Simplified version: Uses STX transfers instead of contract calls
 * to ensure reliable transaction success
 */

import {
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { SCHEDULE, STACKS_CONFIG, TEST_ADDRESSES } from '../src/config.js';

/**
 * Get current nonce for address
 */
async function getNonce(address: string): Promise<number> {
  try {
    const response = await fetch(
      `${STACKS_CONFIG.apiUrl}/extended/v1/address/${address}/nonces`
    );
    const data = await response.json() as any;
    return data.possible_next_nonce || 0;
  } catch (error) {
    console.error('Failed to get nonce:', error);
    return 0;
  }
}

/**
 * Get STX balance
 */
async function getBalance(address: string): Promise<bigint> {
  try {
    const response = await fetch(
      `${STACKS_CONFIG.apiUrl}/extended/v1/address/${address}/stx`
    );
    const data = await response.json() as any;
    return BigInt(data.balance || 0);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return BigInt(0);
  }
}

/**
 * Get a random test address
 */
function randomTestAddress(): string {
  return TEST_ADDRESSES[Math.floor(Math.random() * TEST_ADDRESSES.length)];
}

/**
 * Execute a simple STX transfer
 */
async function executeSTXTransfer(
  privateKey: string,
  nonce: number,
  recipient: string,
  amount: bigint,
  memo: string
): Promise<string | null> {
  console.log(`\nExecuting STX Transfer`);
  console.log(`  Recipient: ${recipient}`);
  console.log(`  Amount: ${amount} microSTX (${Number(amount) / 1_000_000} STX)`);
  console.log(`  Memo: ${memo}`);
  console.log(`  Nonce: ${nonce}`);
  
  try {
    const txOptions = {
      recipient,
      amount,
      senderKey: privateKey,
      network: 'mainnet' as const,
      anchorMode: AnchorMode.Any,
      memo,
      fee: BigInt(SCHEDULE.gasFee),
      nonce: BigInt(nonce),
    };
    
    console.log(`  Building transaction...`);
    const transaction = await makeSTXTokenTransfer(txOptions);
    
    console.log(`  Broadcasting...`);
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: 'mainnet',
    });
    
    if (typeof broadcastResponse === 'string') {
      console.log(`  ✓ Transaction broadcast: ${broadcastResponse}`);
      console.log(`  Explorer: ${STACKS_CONFIG.explorerUrl}/txid/${broadcastResponse}?chain=mainnet`);
      return broadcastResponse;
    }
    
    if (broadcastResponse && typeof broadcastResponse === 'object') {
      if ('txid' in broadcastResponse) {
        const txId = (broadcastResponse as any).txid;
        console.log(`  ✓ Transaction broadcast: ${txId}`);
        console.log(`  Explorer: ${STACKS_CONFIG.explorerUrl}/txid/${txId}?chain=mainnet`);
        return txId;
      }
      if ('error' in broadcastResponse) {
        console.error(`  ✗ Broadcast error: ${(broadcastResponse as any).error}`);
        if ('reason' in broadcastResponse) {
          console.error(`    Reason: ${(broadcastResponse as any).reason}`);
        }
        return null;
      }
    }
    
    console.log(`  Response: ${JSON.stringify(broadcastResponse).substring(0, 200)}`);
    return null;
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

/**
 * Get random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate memo for transaction
 */
function generateMemo(): string {
  const memos = [
    'Builder Activity',
    'Stacks Builder',
    'Daily Activity',
    'Network Support',
    'Community TX',
    'Builder Reward',
    'Ecosystem Growth',
  ];
  return memos[Math.floor(Math.random() * memos.length)];
}

/**
 * Main onchain bot function
 */
export async function runOnchainBot(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Onchain Bot Starting (STX Transfer Mode)');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Network: ${STACKS_CONFIG.network}`);
  console.log(`Address: ${STACKS_CONFIG.address}`);
  
  // Check for private key
  const privateKey = process.env.STACKS_PRIVATE_KEY;
  if (!privateKey) {
    console.error('STACKS_PRIVATE_KEY environment variable not set');
    console.log('Set it in GitHub Secrets or .env file');
    return;
  }
  
  // Check balance
  const balance = await getBalance(STACKS_CONFIG.address);
  console.log(`\nCurrent balance: ${balance} microSTX (${Number(balance) / 1_000_000} STX)`);
  
  // Need enough for transfers + fees
  const minRequired = BigInt((SCHEDULE.minTxAmount + SCHEDULE.gasFee) * 3);
  if (balance < minRequired) {
    console.error(`Insufficient balance. Need at least ${Number(minRequired) / 1_000_000} STX`);
    console.log('Please fund the wallet to continue onchain activity');
    return;
  }
  
  // Get current nonce
  let nonce = await getNonce(STACKS_CONFIG.address);
  console.log(`Starting nonce: ${nonce}`);
  
  // Determine number of transactions (1-2 per run to conserve STX)
  const txCount = randomBetween(SCHEDULE.txPerRun.min, SCHEDULE.txPerRun.max);
  console.log(`Target transactions: ${txCount}`);
  
  const results: Array<{ recipient: string; amount: bigint; txId: string | null }> = [];
  
  for (let i = 0; i < txCount; i++) {
    const recipient = randomTestAddress();
    const amount = BigInt(randomBetween(SCHEDULE.minTxAmount, SCHEDULE.maxTxAmount));
    const memo = generateMemo();
    
    const txId = await executeSTXTransfer(privateKey, nonce, recipient, amount, memo);
    
    results.push({ recipient, amount, txId });
    
    if (txId) {
      nonce++;
    }
    
    // Delay between transactions
    if (i < txCount - 1) {
      console.log('\n  Waiting 3 seconds before next transaction...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Transaction Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.txId !== null);
  console.log(`Successful: ${successful.length}/${txCount}`);
  
  for (const result of results) {
    const status = result.txId ? '✓' : '✗';
    const stxAmount = Number(result.amount) / 1_000_000;
    console.log(`  ${status} ${stxAmount} STX -> ${result.recipient.substring(0, 20)}...`);
    if (result.txId) {
      console.log(`     ${result.txId}`);
    }
  }
  
  // Final balance
  const finalBalance = await getBalance(STACKS_CONFIG.address);
  console.log(`\nFinal balance: ${Number(finalBalance) / 1_000_000} STX`);
  
  console.log('\n' + '='.repeat(60));
  console.log('Onchain Bot Complete');
  console.log('='.repeat(60));
}

// Run if called directly
if (process.argv[1]?.includes('onchain-bot')) {
  runOnchainBot().catch(console.error);
}

export default { runOnchainBot };
