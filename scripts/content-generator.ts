/**
 * Content Generator - Creates meaningful code content for commits
 */

import { DAILY_FOCUS } from '../src/config.js';

// Commit message templates
const COMMIT_MESSAGES = {
  docs: [
    'docs: update API documentation',
    'docs: add usage examples to README',
    'docs: improve installation guide',
    'docs: add troubleshooting section',
    'docs: update configuration options',
    'docs: add deployment guide',
    'docs: improve code comments',
    'docs: add architecture overview',
  ],
  test: [
    'test: add unit tests for utility functions',
    'test: improve test coverage',
    'test: add integration tests',
    'test: fix flaky tests',
    'test: add edge case tests',
    'test: update test fixtures',
    'test: add performance tests',
    'test: improve test assertions',
  ],
  feature: [
    'feat: add new utility function',
    'feat: implement helper method',
    'feat: add validation function',
    'feat: implement formatting utility',
    'feat: add type definitions',
    'feat: implement cache helper',
    'feat: add logging utility',
    'feat: implement retry logic',
  ],
  fix: [
    'fix: resolve edge case in validation',
    'fix: correct type definitions',
    'fix: handle null values properly',
    'fix: improve error handling',
    'fix: resolve memory leak',
    'fix: correct calculation logic',
    'fix: fix async handling',
    'fix: resolve race condition',
  ],
  refactor: [
    'refactor: simplify function logic',
    'refactor: improve code readability',
    'refactor: extract common code',
    'refactor: optimize performance',
    'refactor: reduce code duplication',
    'refactor: improve type safety',
    'refactor: modernize syntax',
    'refactor: improve naming conventions',
  ],
  ci: [
    'ci: update workflow configuration',
    'ci: add caching for dependencies',
    'ci: improve build performance',
    'ci: add deployment step',
    'ci: update Node.js version',
    'ci: add code quality checks',
    'ci: improve test parallelization',
    'ci: add security scanning',
  ],
};

// Code snippet templates
const CODE_SNIPPETS = {
  typescript: {
    utility: (name: string, timestamp: string) => `
/**
 * Utility function generated at ${timestamp}
 * @param input - Input value to process
 * @returns Processed result
 */
export function ${name}(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: expected non-empty string');
  }
  return input.trim().toLowerCase();
}
`,
    interface: (name: string, timestamp: string) => `
/**
 * Interface generated at ${timestamp}
 */
export interface ${name} {
  id: string;
  createdAt: number;
  updatedAt: number;
  data: Record<string, unknown>;
}
`,
    constant: (name: string, timestamp: string) => `
/**
 * Constants generated at ${timestamp}
 */
export const ${name} = {
  VERSION: '1.0.0',
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  CACHE_TTL: 3600,
} as const;
`,
    hook: (name: string, timestamp: string) => `
/**
 * Custom hook generated at ${timestamp}
 */
export function ${name}<T>(initialValue: T) {
  let value = initialValue;
  
  const get = () => value;
  const set = (newValue: T) => { value = newValue; };
  const reset = () => { value = initialValue; };
  
  return { get, set, reset };
}
`,
  },
  test: {
    unit: (name: string, timestamp: string) => `
/**
 * Unit tests generated at ${timestamp}
 */
import { describe, it, expect } from 'vitest';

describe('${name}', () => {
  it('should handle valid input', () => {
    const result = true;
    expect(result).toBe(true);
  });

  it('should handle edge cases', () => {
    const input = '';
    expect(input).toBe('');
  });

  it('should throw on invalid input', () => {
    expect(() => {
      throw new Error('Invalid');
    }).toThrow('Invalid');
  });
});
`,
  },
  documentation: {
    readme: (section: string, timestamp: string) => `

## ${section}

*Updated: ${timestamp}*

This section provides additional information about the implementation.

### Key Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

### Usage

\`\`\`typescript
import { example } from './example';

const result = example();
console.log(result);
\`\`\`
`,
    changelog: (version: string, timestamp: string) => `

## [${version}] - ${timestamp}

### Added
- New utility functions
- Improved documentation
- Additional test coverage

### Changed
- Updated dependencies
- Improved error handling

### Fixed
- Minor bug fixes
- Type corrections
`,
  },
};

/**
 * Get commit type based on day of week
 */
export function getDailyFocus(): string[] {
  const day = new Date().getDay();
  return DAILY_FOCUS[day] || ['docs'];
}

/**
 * Generate random commit message
 */
export function generateCommitMessage(type: string): string {
  const messages = COMMIT_MESSAGES[type as keyof typeof COMMIT_MESSAGES] || COMMIT_MESSAGES.docs;
  const index = Math.floor(Math.random() * messages.length);
  const timestamp = Date.now().toString(36);
  return `${messages[index]} [${timestamp}]`;
}

/**
 * Generate code content for commit
 */
export function generateCodeContent(type: string): { filename: string; content: string } {
  const timestamp = new Date().toISOString();
  const randomId = Math.random().toString(36).substring(7);
  
  switch (type) {
    case 'feature':
    case 'utils':
      const utilName = `process${randomId.charAt(0).toUpperCase()}${randomId.slice(1)}`;
      return {
        filename: `src/utils/${randomId}.ts`,
        content: CODE_SNIPPETS.typescript.utility(utilName, timestamp),
      };
    
    case 'test':
      const testName = `Test${randomId.charAt(0).toUpperCase()}${randomId.slice(1)}`;
      return {
        filename: `tests/${randomId}.test.ts`,
        content: CODE_SNIPPETS.test.unit(testName, timestamp),
      };
    
    case 'docs':
      return {
        filename: 'docs/CHANGELOG.md',
        content: CODE_SNIPPETS.documentation.changelog(`1.0.${Date.now() % 100}`, timestamp),
      };
    
    case 'ci':
      return {
        filename: '.github/config.json',
        content: JSON.stringify({ updated: timestamp, version: randomId }, null, 2),
      };
    
    default:
      return {
        filename: `src/generated/${randomId}.ts`,
        content: CODE_SNIPPETS.typescript.constant(`CONFIG_${randomId.toUpperCase()}`, timestamp),
      };
  }
}

/**
 * Generate multiple commits for a session
 */
export function generateCommitBatch(count: number): Array<{
  type: string;
  message: string;
  files: Array<{ filename: string; content: string }>;
}> {
  const focus = getDailyFocus();
  const commits = [];
  
  for (let i = 0; i < count; i++) {
    const type = focus[i % focus.length];
    commits.push({
      type,
      message: generateCommitMessage(type),
      files: [generateCodeContent(type)],
    });
  }
  
  return commits;
}

export default {
  getDailyFocus,
  generateCommitMessage,
  generateCodeContent,
  generateCommitBatch,
};
