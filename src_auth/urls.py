from django.urls import path

from . import views

urlpatterns = [
    path("intra", views.intra, name="intra"),
    path("intra/confirm", views.intra_confirm, name="intra_confirm"),
    path('logout', views.logout_view, name='logout'),
    path('login', views.LoginView.as_view(), name='login'),
    path('register', views.RegisterView.as_view(), name='register'),
]
