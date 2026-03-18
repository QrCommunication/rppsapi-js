#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# SDK RPPS — Skill Installer
# Detecte les agents AI installes et installe le skill sdk-rpps
# Supports: Claude Code, Cursor, Codex, Windsurf, Cline, Aider
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="sdk-rpps"
INSTALLED=()
SKIPPED=()

echo ""
echo "SDK RPPS — Installation du skill AI"
echo "──────────────────────────────────────"
echo ""

copy_skill() {
  local target_dir="$1"
  local agent_name="$2"
  mkdir -p "$target_dir/$SKILL_NAME/references"
  cp "$SCRIPT_DIR/SKILL.md" "$target_dir/$SKILL_NAME/SKILL.md"
  cp "$SCRIPT_DIR/references/data-sources.md" "$target_dir/$SKILL_NAME/references/data-sources.md"
  INSTALLED+=("$agent_name")
  echo "  [OK] $agent_name -> $target_dir/$SKILL_NAME/"
}

# ── Claude Code ──
if [ -d "$HOME/.claude" ]; then
  echo "[*] Claude Code detecte"
  copy_skill "$HOME/.claude/skills" "Claude Code"
elif command -v claude &>/dev/null; then
  echo "[*] Claude Code CLI detecte"
  mkdir -p "$HOME/.claude/skills"
  copy_skill "$HOME/.claude/skills" "Claude Code"
else
  SKIPPED+=("Claude Code")
fi

# ── Cursor ──
if [ -d "$HOME/.cursor" ] || [ -d "$HOME/Library/Application Support/Cursor" ]; then
  echo "[*] Cursor detecte"
  CURSOR_RULES=""
  if [ -d "$HOME/.cursor" ]; then
    CURSOR_RULES="$HOME/.cursor"
  elif [ -d "$HOME/Library/Application Support/Cursor" ]; then
    CURSOR_RULES="$HOME/Library/Application Support/Cursor"
  fi
  # Cursor utilise .cursorrules ou .cursor/rules — on copie le SKILL.md comme rule
  mkdir -p "$CURSOR_RULES/skills/$SKILL_NAME/references"
  cp "$SCRIPT_DIR/SKILL.md" "$CURSOR_RULES/skills/$SKILL_NAME/SKILL.md"
  cp "$SCRIPT_DIR/references/data-sources.md" "$CURSOR_RULES/skills/$SKILL_NAME/references/data-sources.md"
  INSTALLED+=("Cursor")
  echo "  [OK] Cursor -> $CURSOR_RULES/skills/$SKILL_NAME/"
else
  SKIPPED+=("Cursor")
fi

# ── Codex (OpenAI) ──
if [ -d "$HOME/.agents" ] || command -v codex &>/dev/null; then
  echo "[*] Codex detecte"
  mkdir -p "$HOME/.agents/skills"
  copy_skill "$HOME/.agents/skills" "Codex"
else
  SKIPPED+=("Codex")
fi

# ── Windsurf (Codeium) ──
if [ -d "$HOME/.windsurf" ] || [ -d "$HOME/.codeium" ]; then
  echo "[*] Windsurf detecte"
  WINDSURF_DIR="${HOME}/.windsurf"
  [ ! -d "$WINDSURF_DIR" ] && WINDSURF_DIR="${HOME}/.codeium"
  mkdir -p "$WINDSURF_DIR/skills"
  copy_skill "$WINDSURF_DIR/skills" "Windsurf"
else
  SKIPPED+=("Windsurf")
fi

# ── Cline (VS Code extension) ──
CLINE_DIR="$HOME/.cline"
if [ -d "$CLINE_DIR" ]; then
  echo "[*] Cline detecte"
  mkdir -p "$CLINE_DIR/skills"
  copy_skill "$CLINE_DIR/skills" "Cline"
else
  SKIPPED+=("Cline")
fi

# ── Aider ──
if command -v aider &>/dev/null || [ -d "$HOME/.aider" ]; then
  echo "[*] Aider detecte"
  mkdir -p "$HOME/.aider/skills"
  copy_skill "$HOME/.aider/skills" "Aider"
else
  SKIPPED+=("Aider")
fi

# ── Gemini CLI ──
if command -v gemini &>/dev/null || [ -d "$HOME/.gemini" ]; then
  echo "[*] Gemini CLI detecte"
  mkdir -p "$HOME/.gemini/skills"
  copy_skill "$HOME/.gemini/skills" "Gemini CLI"
else
  SKIPPED+=("Gemini CLI")
fi

# ── Resume ──
echo ""
echo "──────────────────────────────────────"

if [ ${#INSTALLED[@]} -gt 0 ]; then
  echo "Installe (${#INSTALLED[@]}): ${INSTALLED[*]}"
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "Non detecte (${#SKIPPED[@]}): ${SKIPPED[*]}"
fi

if [ ${#INSTALLED[@]} -eq 0 ]; then
  echo ""
  echo "Aucun agent AI detecte. Installation manuelle :"
  echo "  cp -r $SCRIPT_DIR ~/.claude/skills/$SKILL_NAME"
  echo ""
  exit 1
fi

echo ""
echo "Le skill '$SKILL_NAME' sera charge automatiquement quand"
echo "vous travaillez avec @qrcommunication/rppsapi (npm/composer)."
echo ""
