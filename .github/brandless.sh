#!/bin/bash
set -euo pipefail
( git remote add glitch https://github.com/glitch-soc/mastodon &&
  git fetch glitch
) || true

merge_base="$(git merge-base HEAD glitch/main)" || {
  echo "No merge base found, assuming glitch/main"
  merge_base=glitch/main
}

echo "Checking out assets from $merge_base"
git checkout "$merge_base" -- app/javascript/{images,icons} public

echo "Applying brandless patch"
git apply .github/brandless.patch


# To update brandless.patch, Follow these steps
update_patch() {
  git apply --3way .github/brandless.patch
  git reset -- app/javascript/{images,icons} public
  git diff --binary > .github/brandless.patch
}
