from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.urls import reverse
from django.shortcuts import redirect
from django.http import JsonResponse
from main.models import PongUser
from tournament.models import Tournament


# Create your views here.
@csrf_exempt
def create_tournament(request):
    # Authenticate
    if request.method == "POST":
        p1 = request.POST["player1"]
        p2 = request.POST["player2"]
        p3 = request.POST["player3"]
        p4 = request.POST["player4"]

        for p in {p1, p2, p3, p4}:
            try:
                PongUser.objects.get(username=p)
            except PongUser.DoesNotExist:
                return JsonResponse({"error": "That user doesn't exist."}, status=400)

        t = Tournament.objects.create(
            upper_bracket_players=[p1, p2],
            lower_bracket_players=[p3, p4],
            date=timezone.now(),
        )

        return JsonResponse({"id": f"{t.id}"})


@csrf_exempt
def tournament(request, id):
    try:
        t = Tournament.objects.get(id=id)
    except Tournament.DoesNotExist:
        return JsonResponse({"error": "This tournament doesn't exist."}, status=400)

    if (t.get_winner() != ""):
        return JsonResponse({"winner": f"{t.get_winner()}."})

    if request.method == "GET":
        if (t.upper_bracket_winner == ""):
            return (JsonResponse({
                "players": t.upper_bracket_players,
                "bracket": "UPPER",
            }))
        elif (t.lower_bracket_winner == ""):
            return (JsonResponse({
                "players": t.lower_bracket_players,
                "bracket": "LOWER",
            }))
        elif (t.get_winner() == ""):
            return (JsonResponse({
                "players": [t.upper_bracket_winner, t.lower_bracket_winner],
                "bracket": "FINAL",
            }))
        return JsonResponse({"ERROR"})

    if request.method == "POST":
        p1 = request.POST["player1"]
        p2 = request.POST["player2"]
        winner = request.POST["winner"]
        bracket = request.POST["bracket"]

        which = []

        if bracket == "UPPER":
            which = t.upper_bracket_players
        elif bracket == "LOWER":
            which = t.lower_bracket_players
        else:
            which = [t.upper_bracket_winner, t.lower_bracket_winner]

        if (winner != p1 and winner != p2):
            return JsonResponse({"error": "?"}, status=400)

        for p in {p1, p2, winner}:
            if p not in which:
                return JsonResponse({"error": "?"}, status=400)

        if bracket == "UPPER":
            t.upper_bracket_winner = winner;
        elif bracket == "LOWER":
            t.lower_bracket_winner = winner;
        else:
            t.tournament_winner = PongUser.objects.get(username=winner);
        t.save()

        return JsonResponse({"status": "SUCESS"})