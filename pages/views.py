from django.http import HttpResponse
from django.views import View
from django.shortcuts import render
from .models import Person

class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        print(f"username: {request.POST['username']}, password: {request.POST['last_name']}", flush = True)
        person = Person.objects.create(first_name = "bla", last_name = "blu")
        person.save()
        return HttpResponse(request.body)

