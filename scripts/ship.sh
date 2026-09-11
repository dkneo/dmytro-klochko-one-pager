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

# ── knock on the doors ───────────────────────────────────────────────────
# A door is a path the worker answers, not the asset layer. Each must say
# 401 (password) or 200 (open), never 404: a 404 means the asset layer took
# it and the worker never ran. This is how the 8 Sep 2026 outage would have
# been caught at ship time instead of by him the next day.
sleep 8
bad=0
for door in "/names 401" "/names/old 401" "/ask 401" "/scout 401" "/eidos/sit 301"; do
  set -- $door
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 20 "https://dmklochko.com$1")
  if [ "$code" != "$2" ]; then echo "  door $1 answered $code, wanted $2"; bad=1; fi
done
code=$(curl -s -o /dev/null -w '%{http_code}' -m 20 -X POST -H 'content-type: application/json' -d '{}' "https://dmklochko.com/api/eidos/verdict")
if [ "$code" != "401" ]; then echo "  door /api/eidos/verdict answered $code, wanted 401"; bad=1; fi
if [ "$bad" = 1 ]; then echo "shipped, but a door is wrong — check run_worker_first in wrangler.jsonc"; exit 3; fi
echo "doors answer"
