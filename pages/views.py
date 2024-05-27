from django.shortcuts import render, redirect
from random import randint, random

def index(request):
	return render(request, "index.html")

def dashboard(request):
	nomes = [ "Sonic", "Mario", "Cloud", "Link", "Kratos", "Mrs. Croft", "Master Chief", "Samus", "Doomguy", "Pikachu", "Kirby", "Donkey Kong", "Yoshi", "Snake"]

	var = render(request, "dashboard.html", {
		"name": nomes[randint(0, len(nomes)-1)],
		"ratio": "{:.2f}".format(random()),
		"lang": "en",
	})
	print(var)
	return var

def redirect_to_login(request):
	return redirect("/login")
