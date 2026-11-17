#!/usr/bin/env bash
# 一键部署到 Cloudflare（amyeng.top）
#
# 为什么有这个脚本（2026-11-17 踩坑记录）：
#   · `wrangler login` 的 OAuth 只等 2 分钟、设备码只等 5 分钟，人不在电脑前
#     必超时；而且反复登录时打开旧链接会报 invalid_client（看着像账号问题，
#     其实只是链接过期）。
#   · 这台机器 ~/.workbuddy/secrets/cloudflare.env 里存着 API Token，
#     用 CLOUDFLARE_API_TOKEN 环境变量就能直接部署，完全不需要交互。
#   · 注意要在 worker/ 目录部署：worker/wrangler.jsonc 里的 name 是
#     amy-english-api，assets 指向 ../public/。仓库根目录的 wrangler.jsonc
#     name 写成了 "my-nglish-pp"，从根目录部署会新建一个空 worker，别用。
#
# 用法：
#   bash tools/deploy-cf.sh            # 正式发布
#   bash tools/deploy-cf.sh --dry-run  # 只校验配置，不上传
set -euo pipefail
cd "$(dirname "$0")/.."

SECRETS="$HOME/.workbuddy/secrets/cloudflare.env"
if [ ! -f "$SECRETS" ]; then
  echo "缺少凭据文件：$SECRETS"
  echo "去 dash.cloudflare.com/profile/api-tokens 建一个（Workers Scripts: Edit），"
  echo "写成 export CLOUDFLARE_API_TOKEN=xxx 存到上面这个路径。"
  exit 1
fi
# shellcheck disable=SC1090
set -a; . "$SECRETS"; set +a

cd worker
npx --yes wrangler@4 deploy "$@"
