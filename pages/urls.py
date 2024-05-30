from django.urls import path

from . import views

urlpatterns = [
    path("register", views.RegisterView.as_view(), name="register"),
    path("login", views.LoginView.as_view(), name="login"),
    path("account", views.AccountView.as_view(), name="account"),
    path("save_match/<int:right_pk>/<str:score>/<int:pk_winner>", views.save_match, name="save_match"),
    path("make_friends/<str:user2>", views.make_friends, name="make_friends")
]
