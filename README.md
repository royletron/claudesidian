# 🤖 claudesidian

> **Claude Code × Obsidian, automated.** Save any Claude response to your vault with a single command — no copy-paste, no faff, just vibes.

---

## ✨ What is this?

You're mid-conversation with Claude, it just dropped an absolute banger of an explanation, and you think *"I want that in my Obsidian vault forever."*

Normally you'd copy it, switch apps, create a note, paste it, add a title, sort the formatting... ugh.

**With claudesidian, you just type `/send-to-vault`.** That's it. Claude writes the note, dates it, adds frontmatter, and drops it straight into your vault. Obsidian picks it up instantly. You stay in flow. 🌊

---

## 🚀 Install

```sh
npx claudesidian
```

You'll get a beautiful interactive setup that:

- 📋 **Explains exactly** what it's going to do before doing anything
- 📍 **Shows you the locations** it'll write to
- 🔐 **Lists the permissions** it'll add to Claude Code
- ✅ **Asks for confirmation** before touching a single file

---

## 🎮 Usage

In **any** Claude Code conversation, just type:

```
/send-to-vault
```

Claude will:

1. 🔍 Grab the last response from the conversation
2. 📅 Generate a dated filename — e.g. `2026-02-27 React Query Setup Guide.md`
3. 📝 Wrap it in YAML frontmatter (`created`, `source: claude`)
4. 💾 Write it straight to your vault folder

Obsidian detects the new file immediately. No plugin needed. Pure filesystem magic. 🪄

---

## ⚙️ Configuration

Config lives at `~/.claude/vault-config.json`:

```json
{
  "vault_path": "~/Documents/MyVault",
  "folder": "🤖 Inbox"
}
```

To reconfigure (e.g. new vault, different folder), just run `npx claudesidian` again — it'll show your current settings and let you update them.

---

## 🔐 Permissions

claudesidian automatically configures the right Claude Code permissions in `~/.claude/settings.json` so you're never interrupted mid-save with an approval prompt:

| Permission | What it allows |
|---|---|
| `Write(~/your-vault/**)` | Creating new notes |
| `Edit(~/your-vault/**)` | Updating existing notes |
| `Bash(mkdir -p ~/your-vault/*)` | Creating folders (scoped to your vault) |
| `Read(~/.claude/vault-config.json)` | Reading your config |

These are **scoped to your vault path** — nothing broader than it needs to be.

---

## 📦 Requirements

- [Claude Code](https://claude.ai/claude-code) — the AI coding CLI
- [Obsidian](https://obsidian.md) — with a local vault
- Node.js 18+

---

## 📄 License

MIT — go wild. 🎉
