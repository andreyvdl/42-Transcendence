FROM python:3.10-bullseye

RUN apt update && apt install -y postgresql-common postgresql-client gettext

WORKDIR /app

COPY . .

RUN mkdir locale

ENV DJANGO_SETTINGS_MODULE=core.settings

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN python manage.py makemessages --all
RUN python manage.py compilemessages

RUN chmod +x ./entrypoint.sh

# ENTRYPOINT [ "bash" ]
ENTRYPOINT ["./entrypoint.sh"]
