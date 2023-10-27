#!/bin/bash
set -euo pipefail
( git remote add upstream https://github.com/glitch-soc/mastodon &&
  git fetch upstream
) || true

merge_base="$(git merge-base HEAD upstream/main)" || {
  echo "No merge base found, assuming upstream/main"
  merge_base=upstream/main
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
