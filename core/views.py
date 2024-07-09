import base64

from django.shortcuts import render
from django.urls import reverse
from django.template.loader import render_to_string
from django.http import JsonResponse
from main.models import PongUser, Match, Friendship
from django.db.models import Q
from django.urls import reverse
from django.views import View
from core.settings import DEFAULT_AVATAR

def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"

def home(request):
    if request.method == 'GET':
        if not _ajax(request):
            return render(request, 'base.html')
        elif not request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('login')}, status=302)
        return JsonResponse({'innerHtml': render_to_string('pages/home.html', request=request)})
    JsonResponse({'error': 'SOMETHING WENT WRONG!'}, status=400)


def _get_profile_pic(user):
    if user.profile_picture == '':
        return _to_base64(DEFAULT_AVATAR)
    return _to_base64(user.profile_picture.url[1:])


def _to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        return "data:image/png;base64," + base64_string
    except FileNotFoundError:
        return "File not found. Please provide a valid path to the PNG image."


def _get_pending_friend_requests(pk):
    friendships = Friendship.objects.filter(Q(sent_to=pk) & Q(status='p'))
    pend_friends = []
    for friend in friendships:
        pend_friends.append(friend.sent_by.username)

    return pend_friends


def _get_friends(pk):
    self_username = PongUser.objects.get(pk=pk).username
    friendships = Friendship.objects.filter((Q(sent_to=pk) | Q(sent_by=pk)) &
                                            Q(status='y'))
    friends = []
    for f in friendships:
        friends.append((f.sent_by.username, f.sent_by.online) if not f.sent_by.username == self_username else
                       (f.sent_to.username, f.sent_to.online))

    return friends

def _get_matches(pk):
    matches = Match.objects.filter(Q(left_player=pk) | Q(right_player=pk))
    username = PongUser.objects.get(pk=pk).get_username()
    results = []
    username = user.get_username()

    for m in matches:
        results.append((
            m.date.strftime("%d/%b|%H:%M"),
            m.score,
            True if m.winner.get_username() == username else False,
            m.right_player.get_username() if username == m.left_player.get_username() else m.left_player.get_username(),
        ))

    total_matches = matches.count()
    total_wins = matches.filter(winner=pk).count()

    try:
        winrate = (float(total_wins) / float(total_matches)) * 100
    except:
        winrate = 0.0

    user_info = {
        "total": total_matches,
        "wins": total_wins,
        "loses": matches.exclude(winner=pk).count(),
        "winrate": round(winrate, 1),
    }

    return results, user_info

class AccountView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')

        if not request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('login')}, status=302)

        matches, user_info = _get_matches(request.user.id)
        pend_friends = _get_pending_friend_requests(request.user.id)
        friends = _get_friends(request.user.id)
        ctx = {
            'username': request.user.username,
            'wins': request.user.get_wins(),
            'losses': request.user.get_losses(),
            'pend_friends': pend_friends,
            'picture_url': _get_profile_pic(request.user),
            'friends': friends,
            'matches': matches,
            'user_info': user_info,
        }
        inner_html = render_to_string('pages/account.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        new_username = request.POST['new_username'].strip()
        matches, user_info = _get_matches(request.user.id)
        pend_friends = _get_pending_friend_requests(request.user.id)
        friends = _get_friends(request.user.id)
        ctx = {
            'username': request.user.username,
            'wins': request.user.get_wins(),
            'losses': request.user.get_losses(),
            'picture_url': _get_profile_pic(request.user),
            'friends': friends,
            'pend_friends': pend_friends,
            'matches': matches,
            'user_info': user_info,
        }
        if PongUser.objects.filter(username=new_username).exists():
            ctx['msg'] = '🔴 User already exists.'
        else:
            curr_user = PongUser.objects.get(username=request.user)
            curr_user.username = new_username
            curr_user.save()
            ctx['username'] = curr_user.username
            ctx['msg'] = '🟢 Username changed successfully.'

        inner_html = render_to_string('pages/account.html', ctx)
        return JsonResponse({'innerHtml': inner_html})
