from django.urls import path

from . import views

urlpatterns = [
    path("create", views.create_tournament, name="create_tournament"),
    path("<int:id>/current_match", views.current_match, name="current_match"),
    path("<int:id>/save_match", views.save_match, name="save_match"),
    path("end", views.end_tournament, name="end_tournament"),
]
