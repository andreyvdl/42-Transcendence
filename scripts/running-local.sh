#!/bin/bash

DJANGO_PORT=8000
MINIMUM_VERSION=3.10 # Django 5.0 requires Python 3.10 or higher
VENV_PATH="./.venv"

validPythonVersion () {
	python -c \
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
	echo "ERROR: Python version 3.10 or higher not available or installed"
	exit 1
fi

if ! [ -d $VENV_PATH ]; then
	if ! $PIP_BIN freeze | grep -q "virtualenv"; then
		$PIP_BIN install -U pip
		$PIP_BIN install virtualenv
	fi
	$PYTHON_BIN -m venv ./.venv && source "$VENV_PATH/bin/activate" && \
	$PIP_BIN install -r requirements.txt && dectivate
fi

source "$VENV_PATH/bin/activate"
if [ "$( docker container inspect -f '{{.State.Running}}' postgres )" = "true" ]; then
	$PYTHON_BIN manage.py runserver $DJANGO_PORT
else
	docker-compose up -d db
	$PYTHON_BIN manage.py makemigrations
	$PYTHON_BIN manage.py migrate
	$PYTHON_BIN manage.py runserver $DJANGO_PORT
fi