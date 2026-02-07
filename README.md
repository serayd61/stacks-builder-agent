# Stacks Builder Agent

Automated agent for Stacks Builder Challenge participation. This bot automates GitHub activity and Stacks mainnet interactions to maintain consistent builder activity.

## Features

- **GitHub Automation**: Daily commits across multiple repositories
- **Onchain Activity**: Automated contract interactions on Stacks mainnet
- **Progress Tracking**: Monitor Talent Protocol Builder Score
- **Scheduled Execution**: GitHub Actions cron jobs (3x daily)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Cron)                     │
│                   08:00, 14:00, 20:00 UTC                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   GitHub Bot    │     │  Onchain Bot    │
│                 │     │                 │
│ • Commits       │     │ • Contract Calls│
│ • Documentation │     │ • Token Ops     │
│ • Tests         │     │ • Deposits      │
│ • Features      │     │ • Votes         │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Target Repos   │     │ Stacks Mainnet  │
│                 │     │                 │
│ • defi-sentinel │     │ • whitelist     │
│ • stx-escrow    │     │ • treasury      │
│ • stacks-utils  │     │ • voting        │
│ • analytics     │     │ • tipjar        │
└─────────────────┘     └─────────────────┘
```

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/serayd61/stacks-builder-agent.git
cd stacks-builder-agent
npm install
```

### 2. Configure GitHub Secrets

Go to repository Settings > Secrets and variables > Actions, then add:

| Secret Name | Description |
|-------------|-------------|
| `STACKS_PRIVATE_KEY` | Your Stacks wallet private key (for mainnet txs) |
| `GH_PAT` | GitHub Personal Access Token with `repo` and `workflow` scopes |
| `STACKS_ADDRESS` | Your STX address (e.g., SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB) |

### 3. Enable GitHub Actions

The workflows are already configured. They will run automatically at:
- 08:00 UTC
- 14:00 UTC
- 20:00 UTC

### 4. Manual Trigger

You can also run the agent manually:

```bash
# Run GitHub bot
npm run github-bot

# Run Onchain bot
npm run onchain-bot

# Check progress
npm run progress

# Run all
npm run daily
```

## Configuration

Edit `src/config.ts` to customize:

- Target repositories
- Contract addresses
- Commit frequency
- Transaction amounts

## Deployed Contracts (Mainnet)

The agent interacts with these contracts:

| Contract | Address | Functions |
|----------|---------|-----------|
| whitelist | SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB.whitelist | add-to-whitelist |
| treasury | SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB.treasury | deposit |
| voting | SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB.voting | vote |
| tipjar | SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB.tipjar | send-tip |
| crowdfund | SP2PEBKJ2W1ZDDF2QQ6Y4FXKZEDPT9J9R2NKD9WJB.crowdfund | contribute |

## Expected Results

- **Daily GitHub Activity**: 6-12 commits
- **Daily Onchain Activity**: 3-6 transactions
- **Weekly Total**: ~50+ commits, ~25+ transactions
- **Monthly Gas Cost**: ~15-30 STX

## Security Notes

- Private keys are stored ONLY in GitHub Secrets (encrypted)
- Keep minimal STX in the agent wallet (only for gas fees)
- Rate limiting prevents spam detection
- All commits contain meaningful code changes

## License

MIT License - see [LICENSE](LICENSE)

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.
