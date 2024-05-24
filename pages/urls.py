from django.urls import path

from . import views

urlpatterns = [
	path("login", views.index, name="index"),
	path("", views.redirect_to_login),
]
