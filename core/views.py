from django.shortcuts import render
from django.urls import reverse
from django.template.loader import render_to_string
from django.http import JsonResponse

def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"

def home(request):
    if request.method == 'GET':
        if not _ajax(request):
            return render(request, 'base.html')
        elif not request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('login')}, status=302)
        return JsonResponse({'innerHtml': render_to_string('pages/home.html')})
    elif request.method == 'POST':
        if request.POST['game'] == 'pong':
            return JsonResponse({'redirect': reverse('pong')}, status=302)
        elif request.POST['game'] == 'jkp':
            return JsonResponse({'redirect': reverse('jkp')}, status=302)
    JsonResponse({'error': 'SOMETHING WENT WRONG!'}, status=400)
