#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const HOME = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands');
const CONFIG_PATH = path.join(CLAUDE_DIR, 'vault-config.json');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');
const COMMAND_SRC = path.join(__dirname, 'commands', 'send-to-vault.md');
const COMMAND_DEST = path.join(COMMANDS_DIR, 'send-to-vault.md');

function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function applyPermissions(vaultPath) {
  // Resolve ~ so the glob is an absolute path
  const resolvedVault = vaultPath.replace(/^~/, HOME);
  const newRules = [
    `Write(${resolvedVault}/**)`,
    `Edit(${resolvedVault}/**)`,
    `Bash(mkdir -p ${resolvedVault}/*)`,
    `Read(~/.claude/vault-config.json)`,
  ];

  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
      // Malformed — start fresh
    }
  }

  if (!settings.permissions) settings.permissions = {};
  if (!settings.permissions.allow) settings.permissions.allow = [];

  // Remove any stale claudesidian rules (vault path may have changed)
  const isClaudesidianRule = r =>
    r.includes('vault-config.json') || r.startsWith(`Write(`) || r.startsWith(`Edit(`) || r.startsWith(`Bash(mkdir`);
  settings.permissions.allow = settings.permissions.allow.filter(r => !isClaudesidianRule(r));

  settings.permissions.allow.push(...newRules);

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
  console.log(`✓ Permissions added to ~/.claude/settings.json`);
}

async function main() {
  console.log('\nclaudesidian — Claude Code → Obsidian bridge\n');

  // Ensure ~/.claude/commands/ exists
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });

  // Install the slash command
  fs.copyFileSync(COMMAND_SRC, COMMAND_DEST);
  console.log('✓ Installed /send-to-vault command into Claude Code');

  // Check for existing config
  let existing = null;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      console.log(`✓ Found existing config:`);
      console.log(`    vault:  ${existing.vault_path}`);
      console.log(`    folder: ${existing.folder}`);

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await prompt(rl, '\nUpdate vault settings? (y/N) ');
      rl.close();

      if (answer.trim().toLowerCase() !== 'y') {
        console.log('\nAll done! In any Claude conversation, type /send-to-vault\n');
        return;
      }
    } catch {
      // Malformed config — proceed to reconfigure
    }
  }

  // Prompt for vault settings
  const defaultVault = existing?.vault_path ?? '~/Documents/MyVault';
  const defaultFolder = existing?.folder ?? '🤖 Inbox';

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const vaultRaw = await prompt(rl, `\nObsidian vault path (${defaultVault}): `);
  const folderRaw = await prompt(rl, `Inbox folder name   (${defaultFolder}): `);
  rl.close();

  const config = {
    vault_path: vaultRaw.trim() || defaultVault,
    folder: folderRaw.trim() || defaultFolder,
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
  console.log(`\n✓ Config saved to ~/.claude/vault-config.json`);

  applyPermissions(config.vault_path);

  console.log('\nAll done! In any Claude conversation, type /send-to-vault\n');
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
