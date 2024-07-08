from django.urls import path

from . import views

urlpatterns = [
    path("", views.create_tournament, name="create_tournament"),
    path("<int:id>", views.tournament, name="tournament"),
]
