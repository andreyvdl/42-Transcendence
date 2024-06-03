DOCKER_COMPOSE_PATH=./docker-compose.yml

all: up

up:
	docker-compose -f $(DOCKER_COMPOSE_PATH) up -d --build

debug: down
	docker-compose -f $(DOCKER_COMPOSE_PATH) up

down:
	docker-compose -f $(DOCKER_COMPOSE_PATH) down

local:
	./scripts/running-local.sh

restart: down up

clean:
	docker image prune -af

fclean: down clean
	docker system prune -af

re: fclean all

.PHONY: all up down clean fclean re restart run-local debug
