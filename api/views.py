import json

from django.http import JsonResponse
from main.models import PongUser, Match, Friendship
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver


@csrf_exempt
@login_required(login_url='login')
def answer_friend_request(request, username):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ans = data["ans"]
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Expected an 'ans' field in JSON."}, status=400)
        try:
            pong_user = PongUser.objects.get(username=username)
        except PongUser.DoesNotExist:
            return JsonResponse({"error": "That user doesn't exist."}, status=400)
        if ans not in ['y', 'n']:
            return JsonResponse({'error': 'Invalid answer'}, status=400)

        friendship = Friendship.objects.filter((Q(sent_by=request.user.id) & Q(sent_to=pong_user)) |
                                               (Q(sent_to=request.user.id) & Q(sent_by=pong_user))).first()
        if ans == 'n':
            friendship.delete()
        else:
            friendship.status = ans
            friendship.save()
        return JsonResponse({'friendship': pong_user.id})

    return JsonResponse({'error': 'Expected POST'}, status=400)


@csrf_exempt
@login_required(login_url='login')
def make_friends(request, send_to_user: str):
    if request.method == "POST":
        if request.user.username == send_to_user:
            return JsonResponse({"error": "Can't send a friend request to yourself."}, status=400)
        if not PongUser.objects.filter(username=send_to_user).exists():
            return JsonResponse({"error": "This user does not exist."}, status=400)

        sent_by = PongUser.objects.get(pk=request.user.id)
        send_to_user = PongUser.objects.get(username=send_to_user)

        request_exists = Friendship.objects.filter((Q(sent_by=request.user.id) & Q(sent_to=send_to_user.id)) |
                                                   (Q(sent_to=request.user.id) & Q(sent_by=send_to_user.id))).exists()

        if request_exists:
            return JsonResponse({"error": "Friend request already exists."}, status=400)

        friendship = Friendship.objects.create(
            sent_by=sent_by,
            sent_to=send_to_user
        )

        return JsonResponse({"friendship": friendship.id})

    return JsonResponse({'error': 'Expected POST'}, status=400)


@login_required(login_url='login')
def save_match(request, right_pk, score, pk_winner):
    left_pk = request.user.id
    if left_pk == right_pk:
        return JsonResponse({"error": "How come a player be against himself?"}, status=400)
    elif pk_winner not in {right_pk, left_pk}:
        return JsonResponse({"error": "How come a player that's not present in the match be the winner?"}, status=400)
    elif not PongUser.objects.filter(pk=right_pk).exists():
        return JsonResponse({'error': 'Right player not found.'}, status=400)
    elif not PongUser.objects.filter(pk=left_pk).exists():
        return JsonResponse({'error': 'Left player not found.'}, status=400)

    left_player = PongUser.objects.get(pk=left_pk)
    right_player = PongUser.objects.get(pk=right_pk)
    winner = PongUser.objects.get(pk=pk_winner)

    match = Match.objects.create(
        left_player=left_player,
        right_player=right_player,
        winner=winner,
        score=score
    )

    return JsonResponse({'match_id': match.id})

@csrf_exempt
@login_required(login_url='login')
def offline(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = False
    request.user.save()
    return JsonResponse({'msg': 'offline'})



@csrf_exempt
@login_required(login_url='login')
def online(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = True
    request.user.save()
    return JsonResponse({'msg': 'online'})


@receiver(user_logged_out)
def on_logout(sender, request, user, **kwargs):
    user.online = False
    user.save()
