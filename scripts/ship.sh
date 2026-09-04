#!/usr/bin/env bash
# Ship: build → test → commit → push, and nothing ships red.
#
# A hand-written chain pushed a red suite twice in one day, both times from a
# single ';' where '&&' was meant. This script is the only way to push now:
# `set -e` stops at the first failing step, and the tests run before anything
# is added. Usage:
#
#   scripts/ship.sh "commit message" [paths…]
#
# With no paths, everything is added. The build stamp in public/map.json is
# restored first so it never rides along.
set -euo pipefail
msg="${1:?commit message required}"; shift || true
cd "$(dirname "$0")/.."
git checkout -- public/map.json 2>/dev/null || true
npm run build > /tmp/ship-build.log 2>&1 || { tail -20 /tmp/ship-build.log; echo "build failed — nothing shipped"; exit 1; }
node --test tests/*.test.mjs > /tmp/ship-test.log 2>&1 || { grep -E '✖|AssertionError' /tmp/ship-test.log | head -12; grep -E 'ℹ (pass|fail)' /tmp/ship-test.log; echo "suite red — nothing shipped"; exit 1; }
grep -E 'ℹ (pass|fail)' /tmp/ship-test.log
if [ "$#" -gt 0 ]; then git add -- "$@"; else git add -A; fi
git -c commit.gpgsign=false commit -q -m "$msg" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push origin master 2>&1 | tail -1
# Cloudflare's git build has skipped a push that arrived a minute after another.
# Wait for a deployment newer than this push; say so plainly if none comes.
pushed=$(date -u +%s)
for i in 1 2 3 4 5 6 7 8 9; do
  newest=$(npx wrangler deployments list 2>/dev/null | grep -E '^Created:' | tail -1 | awk '{print $2}')
  if [ -n "$newest" ] && [ "$(date -u -j -f '%Y-%m-%dT%H:%M:%S' "${newest%%.*}" +%s 2>/dev/null || echo 0)" -ge "$pushed" ]; then echo "deployed: $newest"; exit 0; fi
  sleep 20
done
echo "no deployment appeared within 3 minutes — run 'npx wrangler deploy' to publish the build that just passed"
exit 2
