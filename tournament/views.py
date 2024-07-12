import json
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.template.loader import render_to_string
from django.http import JsonResponse
from main.models import PongUser
from tournament.models import Tournament


# Create your views here.
@csrf_exempt
def create_tournament(request):
    # Authenticate
    if request.method == "POST":
        game = request.POST["game"]
        p1 = request.user.username
        p2 = request.POST["player2"]
        p3 = request.POST["player3"]
        p4 = request.POST["player4"]

        if not game in ["pong", "jkp"]:
            inner_html = render_to_string("pages/home.html", {"err_msg": "Invalid game."}, request=request)
            return JsonResponse({"innerHtml": inner_html})

        for p in {p1, p2, p3, p4}:
            try:
                PongUser.objects.get(username=p)
            except PongUser.DoesNotExist:
                inner_html = render_to_string("pages/home.html", {"err_msg": f"User \"{p}\" doesn't exist."}, request=request)
                return JsonResponse({"innerHtml": inner_html})

        t = Tournament.objects.create(
            game=game,
            upper_bracket_players=[p1, p2],
            lower_bracket_players=[p3, p4],
            date=timezone.now(),
        )

        return JsonResponse({"id": f"{t.id}"})


@csrf_exempt
def current_match(request, id):
    try:
        t = Tournament.objects.get(id=id)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "This tournament doesn't exist."}, status=400)

    if (t.get_winner() != ""):
        inner_html = render_to_string("pages/tournament-result.html", {
            "game": t.game,
            "winner": t.get_winner(),
            "players": t.upper_bracket_players + t.lower_bracket_players,
        }, request=request)
        return JsonResponse({"innerHtml": inner_html})

    if request.method == "GET":
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

        return JsonResponse({"innerHtml": render_to_string(f"pages/{t.game}.html", ctx)})

def save_match(request, id):
    try:
        t = Tournament.objects.get(id=id)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "This tournament doesn't exist."}, status=400)

    if (t.get_winner() != ""):
        return JsonResponse({"winner": f"{t.get_winner()}."})

    if request.method == "POST":
        data = json.loads(request.body)
        p1 = data["player1"]
        p2 = data["player2"]
        winner = data["winner"]
        bracket = data["bracket"]

        which = []

        if bracket == "UPPER":
            which = t.upper_bracket_players
        elif bracket == "LOWER":
            which = t.lower_bracket_players
        else:
            which = [t.upper_bracket_winner, t.lower_bracket_winner]

        if (winner != p1 and winner != p2):
            return JsonResponse({"error": "Winner must be either player1 or player2."}, status=400)

        for p in {p1, p2, winner}:
            if p not in which:
                return JsonResponse({"error": f"Player {p} is not in the specified bracket."}, status=400)

        if bracket == "UPPER":
            t.upper_bracket_winner = winner;
        elif bracket == "LOWER":
            t.lower_bracket_winner = winner;
        else:
            t.tournament_winner = PongUser.objects.get(username=winner);
        t.save()

        return JsonResponse({"status": "SUCCESS"})