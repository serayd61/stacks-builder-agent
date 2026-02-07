/**
 * Onchain Bot - Automated Stacks mainnet transactions
 * Uses @stacks/transactions for building and broadcasting txs
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV,
  someCV,
  stringUtf8CV,
} from '@stacks/transactions';
import { CONTRACTS, SCHEDULE, STACKS_CONFIG, TEST_ADDRESSES } from '../src/config.js';

// Transaction types we can execute
type ContractAction = {
  contract: string;
  function: string;
  args: any[];
  description: string;
};

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
 * Generate random action for contract interactions
 */
function generateAction(): ContractAction {
  const actions: ContractAction[] = [
    // Whitelist operations
    {
      contract: 'whitelist',
      function: 'add-to-whitelist',
      args: [standardPrincipalCV(randomTestAddress())],
      description: 'Add address to whitelist',
    },
    // Treasury operations
    {
      contract: 'treasury',
      function: 'deposit',
      args: [uintCV(SCHEDULE.minTxAmount)],
      description: 'Deposit to treasury',
    },
    // Voting operations
    {
      contract: 'voting',
      function: 'vote',
      args: [
        uintCV(1),
        uintCV(1),
        uintCV(100),
      ],
      description: 'Vote on proposal',
    },
    // Tipjar operations
    {
      contract: 'tipjar',
      function: 'send-tip',
      args: [
        standardPrincipalCV(randomTestAddress()),
        uintCV(SCHEDULE.minTxAmount),
        someCV(stringUtf8CV('Builder Agent tip')),
      ],
      description: 'Send tip',
    },
    // Crowdfund operations
    {
      contract: 'crowdfund',
      function: 'contribute',
      args: [
        uintCV(1),
        uintCV(SCHEDULE.minTxAmount),
      ],
      description: 'Contribute to crowdfund',
    },
    // Referral operations
    {
      contract: 'referral',
      function: 'register-referral',
      args: [standardPrincipalCV(randomTestAddress())],
      description: 'Register referral',
    },
  ];
  
  return actions[Math.floor(Math.random() * actions.length)];
}

/**
 * Execute a contract call
 */
async function executeContractCall(
  action: ContractAction,
  privateKey: string,
  nonce: number
): Promise<string | null> {
  const contractInfo = CONTRACTS[action.contract as keyof typeof CONTRACTS];
  
  if (!contractInfo) {
    console.error(`Contract not found: ${action.contract}`);
    return null;
  }
  
  console.log(`\nExecuting: ${action.description}`);
  console.log(`  Contract: ${contractInfo.address}.${contractInfo.name}`);
  console.log(`  Function: ${action.function}`);
  console.log(`  Nonce: ${nonce}`);
  
  try {
    const txOptions = {
      contractAddress: contractInfo.address,
      contractName: contractInfo.name,
      functionName: action.function,
      functionArgs: action.args,
      senderKey: privateKey,
      network: 'mainnet' as const,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: BigInt(SCHEDULE.gasFee),
      nonce: BigInt(nonce),
    };
    
    console.log(`  Building transaction...`);
    const transaction = await makeContractCall(txOptions);
    
    console.log(`  Broadcasting...`);
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: 'mainnet',
    });
    
    if (typeof broadcastResponse === 'string') {
      // Success - txid returned as string
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
    console.error(`  Stack: ${error.stack?.substring(0, 300)}`);
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
 * Main onchain bot function
 */
export async function runOnchainBot(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Onchain Bot Starting');
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
  
  const minRequired = BigInt(SCHEDULE.gasFee * 5);
  if (balance < minRequired) {
    console.error(`Insufficient balance. Need at least ${minRequired} microSTX`);
    return;
  }
  
  // Get current nonce
  let nonce = await getNonce(STACKS_CONFIG.address);
  console.log(`Starting nonce: ${nonce}`);
  
  // Determine number of transactions
  const txCount = randomBetween(SCHEDULE.txPerRun.min, SCHEDULE.txPerRun.max);
  console.log(`Target transactions: ${txCount}`);
  
  const results: Array<{ action: string; txId: string | null }> = [];
  
  for (let i = 0; i < txCount; i++) {
    const action = generateAction();
    const txId = await executeContractCall(action, privateKey, nonce);
    
    results.push({ action: action.description, txId });
    
    if (txId) {
      nonce++;
    }
    
    // Delay between transactions
    if (i < txCount - 1) {
      console.log('\n  Waiting 5 seconds before next transaction...');
      await new Promise(resolve => setTimeout(resolve, 5000));
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
    console.log(`  ${status} ${result.action}`);
    if (result.txId) {
      console.log(`     ${result.txId}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Onchain Bot Complete');
  console.log('='.repeat(60));
}

// Run if called directly
if (process.argv[1]?.includes('onchain-bot')) {
  runOnchainBot().catch(console.error);
}

export default { runOnchainBot };
