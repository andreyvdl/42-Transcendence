from django.urls import path

from . import views

# https://docs.djangoproject.com/en/dev/topics/class-based-views/intro/#decorating-in-urlconf
urlpatterns = [
    path("pong", views.pong, name="pong"),
    path("jkp", views.jkp, name="jkp"),
    path('match-result/', views.match_result),
]
