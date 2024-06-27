import json
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from main.models import PongUser

def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"

def pong(request):
    data = json.loads(request.body)
    ctx = {
        'player1': str(data['player1']),
        'player2': str(data['player2']),
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    if not PongUser.objects.filter(username=ctx['player2']).exists():
        ctx['err_msg'] = 'Player 2 does not exist.'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    if ctx['player1'] == ctx['player2']:
        ctx['err_msg'] = 'How come a player be against himself?'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html', ctx, request=request)})

def jkp(request):
    data = json.loads(request.body)
    ctx = {
        'player1': str(data['player1']),
        'player2': str(data['player2']),
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    if not PongUser.objects.filter(username=ctx['player2']).exists():
        ctx['err_msg'] = 'Player 2 does not exist.'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    if ctx['player1'] == ctx['player2']:
        ctx['err_msg'] = 'How come a player be against himself?'
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html', ctx, request=request)})
