import base64
import os
import requests

from core.settings import DEFAULT_AVATAR
from django.http import JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.contrib.auth import login
from main.models import PongUser, Match, Friendship
from django.db.models import Q
from django.urls import reverse
from django.core.files.base import ContentFile
from datetime import datetime


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


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


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

def pong(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html')})

def jkp(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html')})

class AccountView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')

        if not request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('login')}, status=302)

        matches = Match.objects.filter(Q(left_player=request.user.id) | Q(right_player=request.user.id))
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
        }
        inner_html = render_to_string('pages/account.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        new_username = request.POST['new_username'].strip()
        matches = Match.objects.filter(Q(left_player=request.user.id) | Q(right_player=request.user.id))
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


def _call_api(user_code):
    if user_code is None:
        return None, 'Error on API response'

    data = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv('INTRA_UID'),
        'client_secret': os.getenv('INTRA_SECRET'),
        'code': user_code,
        'redirect_uri': 'http://localhost:8000/pages/intra'
    }

    response = requests.post('https://api.intra.42.fr/oauth/token', data=data)

    if response.status_code != 200:
        return None, 'Error getting token'

    response = requests.get(
        'https://api.intra.42.fr/v2/me',
        headers={'Authorization': 'Bearer ' + response.json()['access_token']}
    )

    if response.status_code != 200:
        return None, 'Error getting user data'

    jsón = response.json()
    ctx = {
        'username': jsón['login'],
        'email': jsón['email'],
    }

    if jsón.get('image') is None or not jsón['image']['link']:
        ctx['picture_url'] = None
    else:
        ctx['picture_url'] = jsón['image']['link']

    return ctx, None


def _register_intra(request, ctx):
    if PongUser.objects.filter(username=ctx['username']).exists():
        ctx['username'] += datetime.now().strftime('%Y%m%d_%H%M%S')
    try:
        pong_user = PongUser.objects.create_user(
            email=ctx['email'],
            username=ctx['username'],
            profile_picture=None
        )
        if ctx['picture_url'] is not None:
            pong_user.profile_picture.save(
                f"{ctx['username']}.png",
                ContentFile(requests.get(ctx['picture_url']).content)
            )
        pong_user.save()
    except:
        return JsonResponse({'error': 'Error creating user'}, status=400)

    login(request, pong_user)
    return redirect('account')


def intra(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Expected GET'}, status=400)
    ctx, err = _call_api(request.GET['code'])

    if err is not None:
        return JsonResponse({'error': err}, status=400)
    if PongUser.objects.filter(email=ctx['email']).exists():
        user = PongUser.objects.get(email=ctx['email'])
        login(request, user)
        return redirect('account')
    else:
        return _register_intra(request, ctx)
