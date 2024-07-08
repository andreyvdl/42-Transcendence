from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.urls import reverse
from django.shortcuts import redirect
from django.http import JsonResponse
from main.models import PongUser
from tournament.models import Tournament, TournamentMatch

# Create your views here.
@csrf_exempt
def create_tournament(request):
    # Autheticate
    if request.method == "POST":
        users = request.POST["users"].split(',')
        if (len(users) < 2):
            return JsonResponse({"error": "ERROR"}, status=400)

        for user in users:
            try:
                user_entry = PongUser.objects.get(username=user)
            except PongUser.DoesNotExist:
                return JsonResponse({"error": "That user doesn't exist."}, status=400)

        tournament = Tournament.objects.create(
            players=users,
            date=timezone.now(),
        )

        for i in range(0, len(users), 2):
            tm = TournamentMatch.objects.create(match_round=0, player_one=users[i], player_two=users[i + 1])
            tournament.round_matches.add(tm)

        return redirect(reverse("tournament", args=[tournament.id]))

@csrf_exempt
def tournament(request, id):
    return JsonResponse({"ID": f"{id}"}, status=200)