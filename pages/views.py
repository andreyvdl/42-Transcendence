from django.http import HttpRequest
from django.shortcuts import render, redirect
from django.views import View
from random import randint, random

def is_ajax(request):
	return request.headers.get("X-Requested-With") == "XMLHttpRequest"

class Login(View):
	@staticmethod
	def get(request):
		if not is_ajax(request):
			return render(request, "base.html")
		return render(request, "login.html")

	@staticmethod
	def post(request):
		return redirect("dashboard")

class Register(View):
	@staticmethod
	def get(request):
		if not is_ajax(request):
			return render(request, "base.html")
		return render(request, "register.html")

	@staticmethod
	def post(request):
		return redirect("dashboard")

def dashboard(request):
	if not is_ajax(request):
		return render(request, "base.html")
	nomes = [ "Sonic", "Mario", "Cloud", "Link", "Kratos", "Mrs. Croft", "Master Chief", "Samus", "Doomguy", "Pikachu", "Kirby", "Donkey Kong", "Yoshi", "Snake"]
	return render(request, "dashboard.html", {
		"name": nomes[randint(0, len(nomes)-1)],
		"ratio": "{:.2f}".format(random()),
	})

def redirect_to_login(request):
	if not is_ajax(request):
		return render(request, "base.html")
	return redirect("/login")

def pong(request):
	print(request.path)
	if not is_ajax(request):
		return render(request, "base.html")
	return render(request, "pong-game/index.html")

def pong3D(request):
	if not is_ajax(request):
		return render(request, "base.html")
	return render(request, "pong-game-3d/index.html")

def jkp(request):
	if not is_ajax(request):
		return render(request, "base.html")
	return render(request, "jan-ken-pon/index.html")
