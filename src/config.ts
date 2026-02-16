/**
 * Stacks Builder Agent Configuration
 */

// Stacks Network Configuration
export const STACKS_CONFIG = {
  network: 'mainnet' as const,
  apiUrl: 'https://api.hiro.so',
  explorerUrl: 'https://explorer.hiro.so',
  // Your wallet address
  address: process.env.STACKS_ADDRESS || 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
};

// Deployed Contracts for Onchain Activity
export const CONTRACTS = {
  whitelist: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'whitelist',
    functions: ['add-to-whitelist', 'remove-from-whitelist', 'is-whitelisted'],
  },
  treasury: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'treasury',
    functions: ['deposit', 'get-balance'],
  },
  voting: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'voting',
    functions: ['vote', 'create-proposal', 'get-proposal'],
  },
  tipjar: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'tipjar',
    functions: ['send-tip', 'get-tips-received'],
  },
  crowdfund: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'crowdfund',
    functions: ['contribute', 'get-campaign'],
  },
  referral: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'referral',
    functions: ['register-referral'],
  },
  airdrop: {
    address: 'SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB',
    name: 'airdrop',
    functions: ['claim'],
  },
};

// Target Repositories for GitHub Activity
export const REPOSITORIES = [
  {
    owner: 'serayd61',
    name: 'stacks-defi-sentinel',
    path: '/Users/serkanaydin/stacks/stacks-blockchain-api/defi-monitor',
    types: ['feature', 'docs', 'test', 'refactor', 'ci'],
  },
  {
    owner: 'serayd61',
    name: 'stx-escrow',
    path: '/Users/serkanaydin/stacks/stx-escrow',
    types: ['feature', 'docs', 'test'],
  },
  {
    owner: 'serayd61',
    name: 'stacks-utils',
    path: '/Users/serkanaydin/stacks/stacks-utils',
    types: ['feature', 'docs', 'test', 'refactor'],
  },
  {
    owner: 'serayd61',
    name: 'stacks-oracle',
    path: '/Users/serkanaydin/stacks/stacks-oracle',
    types: ['feature', 'docs', 'test'],
  },
  {
    owner: 'serayd61',
    name: 'stacks-builder-agent',
    path: '/Users/serkanaydin/stacks/stacks-builder-agent',
    types: ['feature', 'docs', 'ci', 'refactor'],
  },
];

// Activity Schedule - Optimized for Builder Rewards
export const SCHEDULE = {
  // Number of commits per run (increased for more activity)
  commitsPerRun: { min: 3, max: 5 },
  // Number of onchain transactions per run
  txPerRun: { min: 1, max: 2 },
  // Minimum STX amount for transactions (in microSTX)
  minTxAmount: 1000, // 0.001 STX
  maxTxAmount: 5000, // 0.005 STX (reduced to conserve STX)
  // Gas fee (in microSTX)
  gasFee: 3000, // 0.003 STX (reduced for efficiency)
};

// Day-specific commit types
export const DAILY_FOCUS: Record<number, string[]> = {
  0: ['docs', 'comments'], // Sunday
  1: ['docs', 'readme'],   // Monday
  2: ['test', 'unit'],     // Tuesday
  3: ['utils', 'helpers'], // Wednesday
  4: ['fix', 'optimize'],  // Thursday
  5: ['feature', 'new'],   // Friday
  6: ['ci', 'config'],     // Saturday
};

// Test addresses for whitelist operations
export const TEST_ADDRESSES = [
  'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R',
  'SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S',
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
];

export default {
  STACKS_CONFIG,
  CONTRACTS,
  REPOSITORIES,
  SCHEDULE,
  DAILY_FOCUS,
  TEST_ADDRESSES,
};
