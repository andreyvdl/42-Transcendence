from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from django.shortcuts import redirect
from . import views


def _go_home(request):
    return redirect("home")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("games/", include("games.urls")),
    path("tournament/", include("tournament.urls")),
    path("home/", views.home, name='home'),
    path('auth/', include("src_auth.urls")),
    path("account/", views.AccountView.as_view(), name="account"),
    path("", _go_home),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
