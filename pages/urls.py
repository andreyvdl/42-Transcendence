from django.urls import path
from django.contrib.auth.decorators import login_required

from . import views

# https://docs.djangoproject.com/en/dev/topics/class-based-views/intro/#decorating-in-urlconf
urlpatterns = [
    path("home", views.home, name="home"),
    path("register", views.RegisterView.as_view(), name="register"),
    path("login", views.LoginView.as_view(), name="login"),
    path("account", views.AccountView.as_view(), name="account"),
    path("save_match/<int:right_pk>/<str:score>/<int:pk_winner>", views.save_match, name="save_match"),
    path("make_friends/<str:send_to_user>/", views.make_friends, name="make_friends"),
    path("answer_friend_request/<str:username>/", views.answer_friend_request, name="answer_friend_request"),
    path("logout", views.logout_view, name="logout_view"),
    path("offline", views.offline, name="offline"),
    path("online", views.online, name="online"),
    path("intra", views.intra, name="intra"),
    path("pong", views.pong, name="pong"),
]
