import json

from django.http import JsonResponse
from django.utils.datastructures import MultiValueDictKeyError
from core.views import _get_friends, _get_matches, _get_pending_friend_requests, _get_profile_pic
from django.template.loader import render_to_string

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
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "Something went wrong in the server.",
            })
        try:
            pong_user = PongUser.objects.get(username=username)
        except PongUser.DoesNotExist:
            return JsonResponse({
                "title": "🟡 WARNING",
                "text": "User doesn't exist or changed username.",
            })
        if ans not in ['y', 'n']:
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "Invalid awnser received.",
            })

        friendship = Friendship.objects.filter((Q(sent_by=request.user.id) & Q(sent_to=pong_user)) |
                                               (Q(sent_to=request.user.id) & Q(sent_by=pong_user))).first()
        if ans == 'n':
            friendship.delete()
            text = "User friendship request declined."
        else:
            friendship.status = ans
            friendship.save()
            text = "User friendship request accepted."
        return JsonResponse({
            "title": "🟢 SUCCESS",
            "text": text,
        })

    return JsonResponse({
        "title": "🔴 ERROR",
        "text": "Invalid awnser received",
    })


@csrf_exempt
@login_required(login_url='login')
def make_friends(request, send_to_user: str):
    if request.method == "POST":
        if request.user.username == send_to_user:
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "Can't send a friend request to yourself.",
            })

        if not PongUser.objects.filter(username=send_to_user).exists():
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "This user does not exist.",
            })

        sent_by = PongUser.objects.get(pk=request.user.id)
        send_to_user = PongUser.objects.get(username=send_to_user)

        request_exists = Friendship.objects.filter((Q(sent_by=request.user.id) & Q(sent_to=send_to_user.id)) |
                                                   (Q(sent_to=request.user.id) & Q(sent_by=send_to_user.id))).exists()

        if request_exists:# and request_exists.status == "p":
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "Friend request already exists.",
            })
        # elif request_exists and request_exists.status == "y":
        #     return JsonResponse({
        #         "title": "🔴 ERROR",
        #         "text": "This person already is your friend.",
        #     })

        friendship = Friendship.objects.create(
            sent_by=sent_by,
            sent_to=send_to_user
        )

        return JsonResponse({
            "title": "🟢 SUCCESS",
            "text": f"Friend request sent to {send_to_user.get_username()}."
        })

    return JsonResponse({
        "title": "🔴 ERROR",
        "text": "Wrong method received.",
    })


@login_required(login_url='login')
def save_match(request, right_name, score, name_winner):
    left_name = request.user.username
    if left_name == right_name:
        return JsonResponse({"error": "How come a player be against himself?"}, status=400)
    elif name_winner not in {right_name, left_name}:
        return JsonResponse({"error": "How come a player that's not present in the match be the winner?"}, status=400)
    elif not PongUser.objects.filter(username=right_name).exists():
        return JsonResponse({'error': 'Right player not found.'}, status=400)
    elif not PongUser.objects.filter(username=left_name).exists():
        return JsonResponse({'error': 'Left player not found.'}, status=400)

    left_player = PongUser.objects.get(username=left_name)
    right_player = PongUser.objects.get(username=right_name)
    winner = PongUser.objects.get(username=name_winner)

    match = Match.objects.create(
        left_player=left_player,
        right_player=right_player,
        winner=winner,
        score=score
    )

    return JsonResponse({'match_id': match.id})


@csrf_exempt
@login_required(login_url='login')
def update_picture(request):
    permited_ext = [".png", ".jpeg", ".jpg", ".gif"]
    if request.method == "POST":
        try:
            file = request.FILES["file"]
            permited_ext.index(file.name[file.name.rfind("."):])
        except:
            return JsonResponse({
                "title": "🔴 ERROR",
                "text": "File isn't a of valid type (png, jpeg/jpg or gif)",
            })
        request.user.profile_picture = file
        request.user.save()

        matches, user_info = _get_matches(request.user.id)
        pend_friends = _get_pending_friend_requests(request.user.id)
        friends = _get_friends(request.user.id)
        ctx = {
            'username': request.user.username,
            'picture_url': _get_profile_pic(request.user),
            'pend_friends': pend_friends,
            'friends': friends,
            'matches': matches,
            'user_info': user_info,
        }
        inner_html = render_to_string('pages/account.html', ctx)
        return JsonResponse({'innerHtml': inner_html})

    return JsonResponse({
        "title": "🔴 ERROR",
        "text": "Wrong method received.",
    })


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
