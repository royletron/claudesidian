# claudesidian

Bridge [Claude Code](https://claude.ai/claude-code) conversations to your [Obsidian](https://obsidian.md) vault with a single slash command.

## How it works

During any Claude Code conversation, type `/send-to-vault` and Claude will save the last response as a dated markdown note directly into a configured folder in your Obsidian vault — no Obsidian plugin required.

## Install

```sh
npx claudesidian
```

This installs the `/send-to-vault` slash command into Claude Code (`~/.claude/commands/`) and walks you through a one-time setup to point it at your vault.

## Usage

In any Claude Code conversation:

```
/send-to-vault
```

Claude will:

1. Find the last assistant response in the conversation
2. Generate a dated filename — e.g. `2026-02-27 React Query Setup Guide.md`
3. Prepend YAML frontmatter (`created`, `source: claude`)
4. Write the file to your configured vault folder

Obsidian automatically picks up new files in the vault, so the note appears instantly.

## Configuration

Config is stored at `~/.claude/vault-config.json`:

```json
{
  "vault_path": "~/Documents/MyVault",
  "folder": "🤖 Inbox"
}
```

To reconfigure, run `npx claudesidian` again and choose to update settings.

## Requirements

- [Claude Code](https://claude.ai/claude-code) CLI installed and authenticated
- [Obsidian](https://obsidian.md) with a local vault
- Node.js 18+

## License

MIT
