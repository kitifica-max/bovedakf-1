---
name: kf1
description: "Access Bóveda KF-1 credentials. Use when the user asks for passwords, credentials, secrets, API keys, or any stored credential. Triggered by /kf1, or when the user mentions KF-1, Bóveda, or credential vault."
allowed-tools: Bash(bash ~/.claude/skills/kf1/kf1.sh *)
---

# KF-1 Credential Vault

Access passwords and credentials from Bóveda KF-1 securely.

## Commands

### List all accessible credentials
```bash
bash ~/.claude/skills/kf1/kf1.sh list
```

### Get a secure view link for a credential
```bash
bash ~/.claude/skills/kf1/kf1.sh view <credential-id>
```

### Check token status
```bash
bash ~/.claude/skills/kf1/kf1.sh status
```

## Setup (first time)
```bash
bash ~/.claude/skills/kf1/kf1.sh setup
```
This will ask you to paste your CLI token from https://kf1.kitifica.com

## Rules
- NEVER display passwords in plain text
- ALWAYS use view links to share credentials
- When listing credentials, show: service, username, and credential ID
- When the user asks for a password, generate a view link and present it
- View links expire in 1 hour
