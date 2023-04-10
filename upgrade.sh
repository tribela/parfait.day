#!/bin/bash
set -eo pipefail

# docker-compose pull
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_BUILDKIT=1

sudo setfacl -R -m "user:$USER:rx" postgres14

docker-compose build # --parallel

docker-compose run --rm -e SKIP_POST_DEPLOYMENT_MIGRATIONS=true web rails db:migrate

# docker-compose down
docker-compose up -d

curl -fs https://parfait.day/health

docker-compose run --rm web rails db:migrate
docker-compose run --rm web tootctl cache clear
docker image prune -f
