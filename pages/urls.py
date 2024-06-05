from django.urls import path

from . import views

urlpatterns = [
	path("login", views.Login.as_view(), name="login"),
	path("register", views.Register.as_view(), name="register"),
	path("dashboard", views.dashboard, name="dashboard"),
	path("pong", views.pong, name="pong"),
	path("pong-3d", views.pong3D, name="pong3D"),
	path("jan-ken-pon", views.jkp, name="jan-ken-pon"),
]
