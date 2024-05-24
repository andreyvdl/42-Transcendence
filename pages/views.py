from django.shortcuts import render, redirect
from random import randint, random

def index(request):
	return render(request, "index.html")

def redirect_to_login(request):
	return redirect("/login")
