import json
from django.http import JsonResponse
from django.template.loader import render_to_string
from main.models import PongUser
from django.shortcuts import redirect


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


def _player_versus_player(player_one, player_two):
    ctx = {
        'player1': player_one,
        'player2': player_two,
        'game_mode': 'pvp',
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
    if not PongUser.objects.filter(username=ctx['player2']).exists():
        ctx['err_msg'] = 'Player 2 does not exist.'
    if ctx['player1'] == ctx['player2']:
        ctx['err_msg'] = "You can't play against yourself."
    return ctx

def _player_versus_environment(player_one):
    ctx = {
        'player1': player_one,
        'player2': 'Marvin',
        'game_mode': 'pve',
    }
    if not PongUser.objects.filter(username=ctx['player1']).exists():
        ctx['err_msg'] = 'Player 1 does not exist.'
    return ctx

def pong(request):
    if not _ajax(request):
        return redirect("/home/")
    ctx = {}
    data = request.POST.dict()
    if not "mode" in data:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "No mode selected.",
        })
    if (data["mode"] == "pvp"):
        ctx = _player_versus_player(request.user.username, data['player2'])
    elif (data["mode"] == "pve"):
        ctx = _player_versus_environment(request.user.username)
    if "err_msg" in ctx:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": ctx['err_msg'],
        })
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html', ctx, request=request)})

def jkp(request):
    if not _ajax(request):
        return redirect("/home/")
    ctx = {}
    data = request.POST.dict()
    if not "mode" in data:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "No mode selected.",
        })
    if (data["mode"] == "pvp"):
        ctx = _player_versus_player(request.user.username, data['player2'])
    elif (data["mode"] == "pve"):
        ctx = _player_versus_environment(request.user.username)
    if "err_msg" in ctx:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": ctx['err_msg'],
        })
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html', ctx, request=request)})

def match_result(request):
    if not _ajax(request):
        return redirect("/home/")

    try:
        data = json.loads(request.body)
        game = data["game"]
        game_mode = data["gameMode"]
        bracket = data["bracket"]
        score_p1 = data["scores"]["p1"]
        score_p2 = data["scores"]["p2"]
        winner = data["winner"]
        player1 = data["player1"]
        player2 = data["player2"]
    except Exception as e:
        return JsonResponse({"error": f"Missing field {str(e)}."})

    ctx = {
        "game": game,
        "game_mode": game_mode,
        "bracket": bracket,
        "score_p1": score_p1,
        "score_p2": score_p2,
        "winner": winner,
        "player1": player1,
        "player2": player2,
    }

    inner_html = render_to_string("pages/match-result.html", ctx, request=request)
    return JsonResponse({'innerHtml': inner_html})
