from django.urls import path
from . import views

urlpatterns = [
    path("online", views.online, name="online"),
    path("offline", views.offline, name="offline"),
    path("make_friends/<str:send_to_user>/", views.make_friends, name="make_friends"),
    path("save_match/<int:right_pk>/<str:score>/<int:pk_winner>", views.save_match, name="save_match"),
    path("answer_friend_request/<str:username>/", views.answer_friend_request, name="answer_friend_request"),
]
