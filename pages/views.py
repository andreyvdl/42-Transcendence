from django.http import HttpResponse
from django.views import View
from django.shortcuts import render
from django.contrib.auth.models import User

class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        nickname = request.POST["nickname"]
        password = request.POST["password"]
        person = User.objects.create_user(
            nickname,
            password = password
        )
        person.save()
        return HttpResponse(200)

