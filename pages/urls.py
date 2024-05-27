from django.urls import path
from django.conf.urls.i18n import i18n_patterns

from . import views

urlpatterns = i18n_patterns(
	path("dashboard", views.dashboard, name="dashboard"),
	path("login", views.index, name="index"),
	path("", views.redirect_to_login),
)
