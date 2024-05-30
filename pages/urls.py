from django.urls import path
from django.contrib.auth.decorators import login_required

from . import views

# https://docs.djangoproject.com/en/dev/topics/class-based-views/intro/#decorating-in-urlconf
urlpatterns = [
    path("register", views.RegisterView.as_view(), name="register"),
    path("login", views.LoginView.as_view(), name="login"),
    path("account", login_required(views.AccountView.as_view(), login_url='login'), name="account"),
    path("save_match/<int:right_pk>/<str:score>/<int:pk_winner>", views.save_match, name="save_match"),
    path("make_friends/<str:user2>", views.make_friends, name="make_friends")
]
