#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');
const rl   = require('readline');
const os   = require('os');

// ── ANSI colours (no deps) ────────────────────────────────────────────────────
const _ = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  purple:  '\x1b[35m',
  magenta: '\x1b[95m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  grey:    '\x1b[90m',
  red:     '\x1b[31m',
};

const purple  = s => `${_.purple}${_.bold}${s}${_.reset}`;
const cyan    = s => `${_.cyan}${s}${_.reset}`;
const yellow  = s => `${_.yellow}${s}${_.reset}`;
const green   = s => `${_.green}${s}${_.reset}`;
const grey    = s => `${_.grey}${s}${_.reset}`;
const bold    = s => `${_.bold}${s}${_.reset}`;
const dim     = s => `${_.dim}${s}${_.reset}`;

// ── Paths ─────────────────────────────────────────────────────────────────────
const HOME          = os.homedir();
const CLAUDE_DIR    = path.join(HOME, '.claude');
const COMMANDS_DIR  = path.join(CLAUDE_DIR, 'commands');
const CONFIG_PATH   = path.join(CLAUDE_DIR, 'vault-config.json');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');
const COMMAND_SRC   = path.join(__dirname, 'commands', 'send-to-vault.md');
const COMMAND_DEST  = path.join(COMMANDS_DIR, 'send-to-vault.md');

// ── Prompt helper ─────────────────────────────────────────────────────────────
function ask(iface, question) {
  return new Promise(resolve => iface.question(question, resolve));
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function printLogo() {
  const pkg = require('./package.json');
  const lines = [
    ``,
    `  ╔═══════════════════════════════════════════════╗`,
    `  ║                                               ║`,
    `  ║   🤖  c l a u d e s i d i a n  📝            ║`,
    `  ║       Claude Code  ×  Obsidian Bridge         ║`,
    `  ║                                               ║`,
    `  ╚═══════════════════════════════════════════════╝`,
    ``,
  ];
  lines.forEach(l => console.log(purple(l)));
  console.log(grey(`  v${pkg.version}\n`));
}

// ── Permissions ───────────────────────────────────────────────────────────────
function buildRules(vaultPath) {
  const resolved = vaultPath.replace(/^~/, HOME);
  return [
    `Write(${resolved}/**)`,
    `Edit(${resolved}/**)`,
    `Bash(mkdir -p ${resolved}/*)`,
    `Read(~/.claude/vault-config.json)`,
  ];
}

function applyPermissions(vaultPath, prevRules = []) {
  const newRules = buildRules(vaultPath);

  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try { settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')); }
    catch { /* start fresh */ }
  }

  if (!settings.permissions)       settings.permissions       = {};
  if (!settings.permissions.allow) settings.permissions.allow = [];

  // Remove only the exact rules we previously wrote (tracked in config)
  settings.permissions.allow = settings.permissions.allow.filter(r => !prevRules.includes(r));
  settings.permissions.allow.push(...newRules);

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
  return newRules;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  printLogo();

  // Load existing config
  let existing = null;
  if (fs.existsSync(CONFIG_PATH)) {
    try { existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
    catch { /* ignore */ }
  }

  const defaultVault  = existing?.vault_path ?? '~/Documents/MyVault';
  const defaultFolder = existing?.folder     ?? '🤖 Inbox';

  // ── Explain the plan ────────────────────────────────────────────────────────
  console.log(bold(cyan('  📋  Here\'s what I\'m going to do:\n')));
  console.log(`  ${green('1.')}  Install ${yellow('/send-to-vault')} into ${grey('~/.claude/commands/')}`);
  console.log(`  ${green('2.')}  Save your vault config to ${grey('~/.claude/vault-config.json')}`);
  console.log(`  ${green('3.')}  Add scoped permissions to ${grey('~/.claude/settings.json')}\n`);

  console.log(bold('  📍  Locations:\n'));
  console.log(`       Vault   ${yellow(defaultVault)}`);
  console.log(`       Folder  ${yellow(defaultFolder)}\n`);

  console.log(bold('  🔐  Permissions that will be added:\n'));
  buildRules(defaultVault).forEach(r => console.log(`       ${dim(r)}`));
  console.log();

  // ── Confirm ─────────────────────────────────────────────────────────────────
  const confirm = rl.createInterface({ input: process.stdin, output: process.stdout });
  const go = await ask(confirm, `  ${_.magenta}${_.bold}✨ Ready to install? (Y/n) ${_.reset}`);
  confirm.close();

  if (go.trim().toLowerCase() === 'n') {
    console.log(`\n${grey('  Cancelled. Nothing was changed.')}\n`);
    return;
  }
  console.log();

  // ── Collect settings ─────────────────────────────────────────────────────
  console.log(bold(cyan('  🗂️  Configure your vault:\n')));

  const input = rl.createInterface({ input: process.stdin, output: process.stdout });

  const vaultRaw = await ask(
    input,
    `  ${bold('Vault path')}   ${grey(`(${defaultVault})`)} ${_.cyan}▸${_.reset} `,
  );
  const folderRaw = await ask(
    input,
    `  ${bold('Inbox folder')} ${grey(`(${defaultFolder})`)} ${_.cyan}▸${_.reset} `,
  );
  input.close();
  console.log();

  const config = {
    vault_path: vaultRaw.trim()  || defaultVault,
    folder:     folderRaw.trim() || defaultFolder,
  };

  // ── Apply ─────────────────────────────────────────────────────────────────
  console.log(bold(cyan('  🚀  Installing...\n')));

  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  fs.copyFileSync(COMMAND_SRC, COMMAND_DEST);
  console.log(`  ${green('✅')}  ${yellow('/send-to-vault')} command installed`);

  const prevRules = existing?._permissions ?? [];
  const newRules  = applyPermissions(config.vault_path, prevRules);
  config._permissions = newRules;

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
  console.log(`  ${green('✅')}  Vault config saved`);
  console.log(`  ${green('✅')}  Claude Code permissions configured`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log();
  console.log(purple('  ╔═══════════════════════════════════════════════╗'));
  console.log(purple('  ║                                               ║'));
  console.log(purple(`  ║   🎉  All done!                               ║`));
  console.log(purple(`  ║                                               ║`));
  console.log(`${_.purple}${_.bold}  ║${_.reset}   Type ${yellow('/send-to-vault')} in any Claude session     ${_.purple}${_.bold}║${_.reset}`);
  console.log(`${_.purple}${_.bold}  ║${_.reset}   to save responses to ${yellow(config.folder)}         ${_.purple}${_.bold}║${_.reset}`);
  console.log(purple('  ║                                               ║'));
  console.log(purple('  ╚═══════════════════════════════════════════════╝'));
  console.log();
}

main().catch(err => {
  console.error(`\n${_.bold}${_.red}  ✗ Error:${_.reset} ${err.message}\n`);
  process.exit(1);
});
