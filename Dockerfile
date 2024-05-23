FROM python:3.10-bullseye

RUN apt update && apt install -y postgresql-common postgresql-client

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
