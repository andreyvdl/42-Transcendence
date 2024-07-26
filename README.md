# 42-Transcendence

## 📝 Description

> This project is about doing something you’ve never done before. Remind yourself
the beginning of your journey in computer science. Look at you now. Time to shine!

## 📦 Stack

- build: [Docker/Docker Compose](https://www.docker.com)
- front: [Bootstrap](https://getbootstrap.com), [Three.js](https://threejs.org)
and JavaScript
- back: [Django](https://www.djangoproject.com)
- database: [Postgres](https://www.postgresql.org)

## 🚧 Infra

![Infrastructure](https://github.com/user-attachments/assets/61f5a59b-37ca-4bb3-a624-34c286fb743d)

## 🤔 What you can do?

- Create an account;
- Login with a created account;
- Login using Intra42;
- See your stats;
- See your match history;
- Add friends;
- See your friends stats;
- Update username;
- Upload a profile picture;
- Play pong against one user;
- Play pong against a bot;
- Play jan-ken-pon against one user;
- Play jan-ken-pon against the luck;
- Play a pong/jan-ken-pon tournament with 4 players;

## 🛠️ How to build for development?

First you will need Docker and Docker Compose,
[Python](https://www.python.org) 3.10+, Postgres and make.  
You will need a .env file and an Intra42 registred API.

```.env
DJANGO_DEBUG=True

SQL_DATABASE=your_database_name
SQL_USER=your_database_user
SQL_PASSWORD=your_database_password
SQL_HOST=your_database_hostname
SQL_PORT=your_database_port

INTRA_UID=your_intra_public_key
INTRA_SECRET=your_intra_secret_key
INTRA_REDIR="http://localhost:8000/auth/intra"
MY_IP=your_LAN_ip
```

After you have everything just run `make local`.
