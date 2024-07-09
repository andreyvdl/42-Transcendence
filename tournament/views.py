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

        return redirect(reverse("tournament", args=[t.id]))


@csrf_exempt
def tournament(request, id):
    return JsonResponse({"ID": f"{id}"}, status=200)