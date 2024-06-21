from django.urls import path

from . import views

# https://docs.djangoproject.com/en/dev/topics/class-based-views/intro/#decorating-in-urlconf
urlpatterns = [
    path("account", views.AccountView.as_view(), name="account"),
    path("pong", views.pong, name="pong"),
    path("jkp", views.jkp, name="jkp"),
]
