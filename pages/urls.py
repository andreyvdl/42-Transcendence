from django.urls import path

from . import views

urlpatterns = [
	path("dashboard", views.dashboard, name="dashboard"),
	path("login", views.index, name="index"),
	path("", views.redirect_to_login),
]
