import json
from django.http import JsonResponse
from django.template.loader import render_to_string
from main.models import PongUser

def _player_versus_player(player_one, player_two):
    ctx = {
        'IA': "off",
        'player1': player_one,
        'player2': player_two,
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
    if not PongUser.objects.filter(username=ctx['player2']).exists():
        ctx['err_msg'] = 'Player 2 does not exist.'
    if ctx['player1'] == ctx['player2']:
        ctx['err_msg'] = 'How come a player be against himself?'
    return ctx

def _player_versus_environment(player_one):
    ctx = {
        'IA': "on",
        'player1': player_one,
        'player2': 'Marvin',
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
    return ctx

def pong(request):
    ctx = {}
    data = request.POST.dict()
    if not "mode" in data:
        return JsonResponse({'error': 'SOMETHING WENT WRONG!(GAME)'}, status=400)
    if (data["mode"] == "pvp"):
        ctx = _player_versus_player(request.user.username, data['player2'])
    elif (data["mode"] == "pve"):
        ctx = _player_versus_environment(request.user.username)
    if "err_msg" in ctx:
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html', ctx, request=request)})

def jkp(request):
    ctx = {}
    data = request.POST.dict()
    if not "mode" in data:
        return JsonResponse({'error': 'SOMETHING WENT WRONG!(GAME)'}, status=400)
    if (data["mode"] == "pvp"):
        ctx = _player_versus_player(request.user.username, data['player2'])
    elif (data["mode"] == "pve"):
        ctx = _player_versus_environment(request.user.username)
    if "err_msg" in ctx:
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', ctx, request=request)})
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html', ctx, request=request)})
