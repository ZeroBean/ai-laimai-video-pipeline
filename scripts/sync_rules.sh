#!/bin/bash
# 从 AGENTS.md 生成各家 Agent 的规矩文件。改规矩只改 AGENTS.md，然后跑：bash scripts/sync_rules.sh
set -e
cd "$(dirname "$0")/.."
NOTE='<!-- 本文件由 scripts/sync_rules.sh 从 AGENTS.md 生成，请勿直接修改 -->'
{ echo "$NOTE"; echo; sed -e '1s/^# AGENTS.md/# CLAUDE.md/' -e '/^> 本文件是所有 AI Agent/d' AGENTS.md; } > CLAUDE.md          # Claude Code
{ echo "$NOTE"; echo; sed -e '1s/^# AGENTS.md/# GEMINI.md/' -e '/^> 本文件是所有 AI Agent/d' AGENTS.md; } > GEMINI.md          # Gemini CLI
{ printf -- '---\ndescription: AI来龙去脉视频制作规矩（流程顺序、内容/画面/质检规矩）\nalwaysApply: true\n---\n'; echo "$NOTE"; echo; sed '/^> 本文件是所有 AI Agent/d' AGENTS.md; } > .cursor/rules/ai-laimai.mdc   # Cursor
echo "已同步：CLAUDE.md GEMINI.md .cursor/rules/ai-laimai.mdc"
