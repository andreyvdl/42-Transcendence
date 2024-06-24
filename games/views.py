from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


def pong(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html')})

def jkp(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html')})
