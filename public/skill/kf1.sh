#!/bin/bash
# kf1 - Bóveda KF-1 CLI for Claude Code
# Usage: kf1.sh <command> [args]
#
# Commands:
#   setup    - Configure your CLI token
#   list     - List all accessible credentials
#   view <id> - Get a secure view link for a credential
#   status   - Check token status

set -euo pipefail

CONFIG_DIR="$HOME/.config/kf1"
TOKEN_FILE="$CONFIG_DIR/token"
API_BASE="https://kf1.kitifica.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ensure_config() {
  if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}No token configured.${NC}"
    echo ""
    echo "Run: bash $0 setup"
    echo ""
    echo "Or configure manually:"
    echo "  mkdir -p $CONFIG_DIR"
    echo "  echo 'YOUR_TOKEN' > $TOKEN_FILE"
    echo "  chmod 600 $TOKEN_FILE"
    exit 1
  fi
}

get_token() {
  cat "$TOKEN_FILE" | tr -d '\n'
}

api_get() {
  local path="$1"
  local token
  token=$(get_token)
  curl -s -H "Authorization: Bearer $token" "$API_BASE$path"
}

api_post() {
  local path="$1"
  local data="${2:-{}}"
  local token
  token=$(get_token)
  curl -s -X POST \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$API_BASE$path"
}

cmd_setup() {
  echo "╔══════════════════════════════════════════════╗"
  echo "║         Bóveda KF-1 - Setup                  ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""
  echo "1. Go to: ${API_BASE}/dashboard/ai-access"
  echo "2. Click 'Generar Token CLI'"
  echo "3. Copy the token"
  echo ""
  read -p "Paste your token here: " token

  if [[ ! "$token" =~ ^kf1_ ]]; then
    echo -e "${RED}Invalid token format. Token must start with kf1_${NC}"
    exit 1
  fi

  mkdir -p "$CONFIG_DIR"
  echo "$token" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"

  echo ""
  echo -e "${GREEN}Token saved successfully!${NC}"
  echo ""
  echo "Testing connection..."
  response=$(api_get "/api/cli/credentials")
  if echo "$response" | grep -q '"credentials"'; then
    count=$(echo "$response" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}Connected! You have $count credential(s) accessible.${NC}"
  else
    echo -e "${YELLOW}Token saved but connection test failed. Check your token.${NC}"
  fi
}

cmd_list() {
  ensure_config
  response=$(api_get "/api/cli/credentials")

  if echo "$response" | grep -q '"error"'; then
    error=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo -e "${RED}Error: $error${NC}"
    exit 1
  fi

  credentials=$(echo "$response" | python3 -c "
import json, sys
data = json.load(sys.stdin)
creds = data.get('credentials', [])
if not creds:
    print('No credentials found.')
else:
    print(f'Found {len(creds)} credential(s):\n')
    for c in creds:
        print(f'  ID: {c[\"id\"]}')
        print(f'  Service: {c[\"service\"]}')
        print(f'  Username: {c[\"username\"]}')
        print(f'  Vault: {c[\"vaultId\"]}')
        print()
" 2>/dev/null)

  if [ -z "$credentials" ]; then
    echo "No credentials found."
  else
    echo "$credentials"
  fi
}

cmd_view() {
  ensure_config
  local cred_id="${1:-}"
  if [ -z "$cred_id" ]; then
    echo -e "${RED}Usage: kf1.sh view <credential-id>${NC}"
    exit 1
  fi

  response=$(api_post "/api/cli/credentials/$cred_id/share")

  if echo "$response" | grep -q '"error"'; then
    error=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo -e "${RED}Error: $error${NC}"
    exit 1
  fi

  url=$(echo "$response" | python3 -c "import json,sys; print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
  expires=$(echo "$response" | python3 -c "import json,sys; print(json.load(sys.stdin).get('expiresAt',''))" 2>/dev/null)

  if [ -n "$url" ]; then
    echo "╔══════════════════════════════════════════════╗"
    echo "║  Secure View Link                            ║"
    echo "╚══════════════════════════════════════════════╝"
    echo ""
    echo "$url"
    echo ""
    echo "Expires: $expires"
    echo ""
    echo "Open this link in a browser to view the credential."
    echo "The password is never sent to the server."
  else
    echo -e "${RED}Failed to generate view link.${NC}"
    exit 1
  fi
}

cmd_status() {
  if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}Not configured. Run: kf1.sh setup${NC}"
    exit 1
  fi

  token=$(get_token)
  echo "Token: ${token:0:8}...${token: -4}"
  echo "Config: $TOKEN_FILE"

  response=$(api_get "/api/cli/credentials")
  if echo "$response" | grep -q '"credentials"'; then
    count=$(echo "$response" | grep -o '"id"' | wc -l)
    echo -e "Status: ${GREEN}Connected${NC}"
    echo "Accessible credentials: $count"
  else
    echo -e "Status: ${RED}Connection failed${NC}"
  fi
}

# Main
case "${1:-help}" in
  setup)
    cmd_setup
    ;;
  list)
    cmd_list
    ;;
  view)
    shift
    cmd_view "$@"
    ;;
  status)
    cmd_status
    ;;
  help|--help|-h)
    echo "kf1 - Bóveda KF-1 CLI for Claude Code"
    echo ""
    echo "Usage: kf1.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  setup        Configure your CLI token"
    echo "  list         List all accessible credentials"
    echo "  view <id>    Get a secure view link for a credential"
    echo "  status       Check token status"
    echo "  help         Show this help"
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    echo "Run: kf1.sh help"
    exit 1
    ;;
esac
