from django.http import HttpResponse
from django.views import View
from django.shortcuts import render
from .models import Person

class RegisterView(View):
    def get(self, request):
        return render(request, "register.html")

    def post(self, request):
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        person = Person.objects.create(first_name = first_name, last_name = last_name)
        person.save()
        return HttpResponse(200)

