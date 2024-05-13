DOCKER_COMPOSE_PATH=./docker/docker-compose.yml

all: up

up:
	docker-compose -f $(DOCKER_COMPOSE_PATH) up -d --build

debug: down
	docker-compose -f $(DOCKER_COMPOSE_PATH) up

down:
	docker-compose -f $(DOCKER_COMPOSE_PATH) down

clean:
	docker image prune -af

fclean: clean
	docker system prune -af

re: fclean all

.PHONY: all up down clean fclean re
