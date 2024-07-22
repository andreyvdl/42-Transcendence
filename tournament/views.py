import json
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.http import JsonResponse
from main.models import PongUser
from tournament.models import Tournament
from django.shortcuts import redirect
from django.shortcuts import render


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"

@login_required(login_url='login')
def create_tournament(request):
    if request.method != "POST":
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "Invalid request method. POST required.",
        })

    try:
        game = request.POST["game"]
        p1 = request.user.username
        p2 = request.POST["player2"]
        p3 = request.POST["player3"]
        p4 = request.POST["player4"]
    except KeyError as e:
        return JsonResponse({"error": f"Missing field {str(e)}."})

    if len([p1, p2, p3, p4]) != len(set([p1, p2, p3, p4])):
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "Duplicate users.",
        })

    if not game in ["pong", "jkp"]:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "Invalid game.",
        })

    for p in {p1, p2, p3, p4}:
        try:
            PongUser.objects.get(username=p)
        except PongUser.DoesNotExist:
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": f"User \"{p}\" doesn't exist.",
            })

    t = Tournament.objects.create(
        game=game,
        upper_bracket_players=[p1, p2],
        lower_bracket_players=[p3, p4],
        date=timezone.now(),
    )

    return JsonResponse({"id": f"{t.id}"})


@login_required(login_url='login')
def current_match(request, id):
    if not _ajax(request):
        return redirect("/home/")
    if request.method != "GET":
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "Invalid request method. POST required.",
        })

    try:
        t = Tournament.objects.get(id=id)
    except Tournament.DoesNotExist:
        return JsonResponse({
            "title": "🔴 ERROR",
            "text": "This tournament doesn't exist.",
        })

    if (t.get_winner() != ""):
        inner_html = render_to_string("pages/tournament-result.html", {
            "game": t.game,
            "winner": t.get_winner(),
            "players": t.upper_bracket_players + t.lower_bracket_players,
        }, request=request)
        return JsonResponse({"innerHtml": inner_html})

    ctx = {}
    if (t.upper_bracket_winner == ""):
        ctx = {
            "game_mode": "tournament",
            "player1": t.upper_bracket_players[0],
            "player2": t.upper_bracket_players[1],
            "bracket": "UPPER",
        }
    elif (t.lower_bracket_winner == ""):
        ctx = {
            "game_mode": "tournament",
            "player1": t.lower_bracket_players[0],
            "player2": t.lower_bracket_players[1],
            "bracket": "LOWER",
        }
    elif (t.get_winner() == ""):
        ctx = {
            "game_mode": "tournament",
            "player1": t.upper_bracket_winner,
            "player2": t.lower_bracket_winner,
            "bracket": "FINAL",
        }

    inner_html = render_to_string(f"pages/{t.game}.html", ctx, request=request)
    return JsonResponse({"innerHtml": inner_html})


@login_required(login_url='login')
def save_match(request, id):
    if request.method != "POST":
        JsonResponse({"error": "Invalid request method. POST required."})

    try:
        t = Tournament.objects.get(id=id)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "This tournament doesn't exist."})

    if (t.get_winner() != ""):
        return JsonResponse({"winner": f"{t.get_winner()}."})

    try:
        data = json.loads(request.body)
        p1 = data["player1"]
        p2 = data["player2"]
        winner = data["winner"]
        bracket = data["bracket"]
    except KeyError as e:
        return JsonResponse({"error": f"Missing field {str(e)}."})

    which = []
    if bracket == "UPPER":
        which = t.upper_bracket_players
    elif bracket == "LOWER":
        which = t.lower_bracket_players
    else:
        which = [t.upper_bracket_winner, t.lower_bracket_winner]

    if (winner != p1 and winner != p2):
        return JsonResponse({
            "error": "Winner must be either player1 or player2.",
        })

    for p in {p1, p2, winner}:
        if p not in which:
            return JsonResponse({
                "error": f"Player {p} is not in the specified bracket.",
            })

    if bracket == "UPPER":
        t.upper_bracket_winner = winner;
    elif bracket == "LOWER":
        t.lower_bracket_winner = winner;
    else:
        t.tournament_winner = PongUser.objects.get(username=winner);
    t.save()

    return JsonResponse({"status": "saved"})