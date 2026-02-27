Save the most recent substantial assistant response from this conversation into the user's Obsidian vault.

## Steps

### 1. Load config
Read `~/.claude/vault-config.json`. It has this shape:
```json
{
  "vault_path": "~/Documents/MyVault",
  "folder": "🤖 Inbox"
}
```

**If the file does not exist**, ask the user:
- "What is the full path to your Obsidian vault?" (e.g. `~/Documents/MyVault`)
- "What folder inside it should Claude responses go into?" (e.g. `🤖 Inbox`)

Then write their answers to `~/.claude/vault-config.json` and proceed.

### 2. Identify the content to save
Use the last substantial assistant response in this conversation — i.e. the most recent message from you (the assistant) that contains meaningful content. Do **not** include the current `/send-to-vault` invocation or this response. If the user specified particular content (e.g. "send that last code block to my vault"), honour that instead.

### 3. Generate a filename
- Format: `YYYY-MM-DD Title Case Title.md` using today's date
- Derive a short, descriptive title (3–6 words) from the content topic
- Use title case, spaces allowed, no special characters
- Example: `2025-08-14 Python FastAPI Auth Setup.md`

### 4. Compose the file content
```
---
created: YYYY-MM-DD
source: claude
---

{content verbatim, preserving all markdown formatting}
```

### 5. Write the file
- Expand `~` to the user's home directory
- Resolve the full path: `{vault_path}/{folder}/{filename}`
- Use `mkdir -p` via Bash to ensure the folder exists
- Use the Write tool to create the file at that path

### 6. Confirm
Tell the user the file was saved, showing the full path. Keep it brief.
