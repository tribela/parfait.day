#!/bin/bash
set -euo pipefail

# docker-compose pull
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1

IMAGE_NAME='ghcr.io/mastodon/mastodon'

rollback() {
  # Rollback
  echo "Rollback deployment"
  docker tag $IMAGE_NAME:stable $IMAGE_NAME:latest
  docker-compose up -d
  exit 1
}

# Save image
docker tag $IMAGE_NAME:latest $IMAGE_NAME:stable

docker-compose build # --parallel

docker-compose run --rm -e SKIP_POST_DEPLOYMENT_MIGRATIONS=true web rails db:migrate

docker-compose up -d --force-recreate --no-deps web-sub
# Ensure stop web-sub container
trap "docker-compose stop web-sub" EXIT

for retry in {4..0}; do
  sleep 10
  curl -fso /dev/null http://localhost:3001/about -H Host:parfait.day -H X-Forwarded-Proto:https && break
  if [[ $retry -eq 0 ]]; then
    rollback
  fi
done


docker-compose up -d --force-recreate --no-deps web sidekiq streaming

for retry in {4..0}; do
  sleep 10
  curl -fso /dev/null http://localhost:3000/about -H Host:parfait.day -H X-Forwarded-Proto:https && break
  if [[ $retry -eq 0 ]]; then
    rollback
  fi
done

curl -fso /dev/null https://parfait.day/about || rollback

docker-compose run --rm web rails db:migrate
docker-compose run --rm web tootctl cache clear
docker-compose stop web-sub
docker image prune -f

echo "OK"
