#!/bin/bash

DJANGO_PORT=8000
MINIMUM_VERSION=3.10 # Django 5.0 requires Python 3.10 or higher
ENV_FILE="./.env"
VENV_PATH="./venv"

validPythonVersion () {
	$1 -c \
	"import sys"\
	"min_version = tuple(map(int, '$MINIMUM_VERSION'.split('.')))"\
	"current_version = sys.version_info[:3]"\
	"if (current_version >= min_version):"\
		"exit(0)"\
	"exit(1)"
	return $?
}

if command -v python > /dev/null && validPythonVersion python; then
	PIP_BIN=pip
	PYTHON_BIN=python
elif command -v python3 > /dev/null && validPythonVersion python3; then
	PIP_BIN=pip3
	PYTHON_BIN=python3
else
	echo "ERROR: Python version $MINIMUM_VERSION or higher not available or installed"
	exit 1
fi

if ! [ -d $VENV_PATH ]; then
	if ! $PIP_BIN freeze | grep -q "virtualenv"; then
		$PIP_BIN install -U pip
		$PIP_BIN install virtualenv
	fi

	$PYTHON_BIN -m venv $VENV_PATH && \
	source "$VENV_PATH/bin/activate" && \
	$PIP_BIN install --upgrade pip && \
	$PIP_BIN install -r requirements.txt && deactivate
fi

source "$VENV_PATH/bin/activate"
if [ -f $ENV_FILE ]; then
	export $(grep -v '^#' $ENV_FILE | xargs)

	export SQL_HOST="localhost"
	export INTRA_REDIRECT="http://localhost:8000/auth/intra"
else
	echo "ERROR: .env not found in path $ENV_FILE"
	exit 1
fi

if ! [ "$( docker container inspect -f '{{.State.Running}}' postgres )" = "true" ]; then
	docker-compose up -d db
	while [[ $(docker container inspect postgres -f '{{.State.Health.Status}}') == "starting" ]]; do
		sleep 3
	done
	if [[ $(docker container inspect postgres -f '{{.State.Health.Status}}') != "healthy" ]]; then
		echo "ERROR: Database error"
		exit 1
	fi;
fi


$PYTHON_BIN manage.py makemigrations main && \
$PYTHON_BIN manage.py migrate && \
$PYTHON_BIN manage.py runserver $DJANGO_PORT
