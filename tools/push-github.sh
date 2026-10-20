#!/usr/bin/env bash
# 一键推送 GitHub（无弹窗、无需输密码）
#
# 背景（2026-10-20 排查结论）：
#   · 弹密码框 = 存进 Windows 凭据管理器的 GitHub 钥匙过期了，git 只能问人要密码；
#   · 之前推送全失败还有第二个原因：会话默认代理 127.0.0.1:50348 已死（CONNECT 502）。
#
# 这个脚本的做法：
#   · token 从 ~/.workbuddy/secrets/github.env 读，只在内存里用，不写进 .git/config；
#   · 关掉凭据助手（-c credential.helper=）→ GCM 不可能弹窗；
#   · 代理固定走 7890（实测可用），不依赖环境变量里的死代理。
#
# 用法：bash tools/push-github.sh
set -euo pipefail
cd "$(dirname "$0")/.."

set -a
. "$HOME/.workbuddy/secrets/github.env"
set +a

PROXY="${GITHUB_PROXY:-http://127.0.0.1:7890}"

GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never \
  git -c credential.helper= \
      -c http.proxy="$PROXY" \
      -c https.proxy="$PROXY" \
      push --progress \
      "https://oauth2:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git" HEAD:main

echo "✅ 已推送到 github.com/${GITHUB_REPO} (main)"
