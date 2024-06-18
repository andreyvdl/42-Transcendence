import json
import base64
import os
import requests

from core.settings import DEFAULT_AVATAR
from django.http import JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login, logout
from .models import PongUser, Match, Friendship
from django.db.models import Q
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError
from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver
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

def home(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/home.html')})

def pong(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/pong.html')})

def jkp(request):
    if not _ajax(request):
        return render(request, 'base.html')
    return JsonResponse({'innerHtml': render_to_string('pages/jkp.html')})

@csrf_exempt
@login_required(login_url='login')
def answer_friend_request(request, username):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ans = data["ans"]
        except (json.JSONDecodeError, KeyError):
            return JsonResponse({'error': 'Expected an \'ans\' field in JSON.'}, status=400)
        try:
            pong_user = PongUser.objects.get(username=username)
        except PongUser.DoesNotExist:
            return JsonResponse({'error': 'That user doesn\'t exist.'}, status=400)
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


class LoginView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')
        if request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('account')}, status=302)
        return JsonResponse({'innerHtml': render_to_string('pages/login.html', request=request)})

    @staticmethod
    def post(request):
        username = request.POST["username"].strip()
        password = request.POST["password"].strip()

        user = authenticate(
            request,
            username=username,
            password=password
        )
        if user is not None:
            login(request, user)
            return JsonResponse({'redirect': reverse('account')}, status=302)
        ctx = {'err': True, 'err_msg': "Invalid username or password"}
        inner_html = render_to_string('pages/login.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})


"""
Essa função é responsável por falar ao database que o usuário está fazendo
logout.
@param request a requisição
"""


@csrf_exempt
@login_required(login_url='login')
def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = False
    request.user.save()
    logout(request)
    return JsonResponse({'redirect': reverse('login')}, status=302)


'''
Essa função é responsável por falar para o database que a pessoa fechou a aba
e agora está offline para todos os outros usuários.
@param request a requisição
'''


@csrf_exempt
@login_required(login_url='login')
def offline(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = False
    request.user.save()
    return JsonResponse({'msg': 'offline'})


'''
Essa função é responsável por falar para o database que a pessoa voltou para
o site e agora está online para todos os outros usuários.
@param request a requisição
'''


@csrf_exempt
@login_required(login_url='login')
def online(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = True
    request.user.save()
    return JsonResponse({'msg': 'online'})


class RegisterView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')
        if request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('account')}, status=302)
        inner_html = render_to_string('pages/register.html', request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        email = request.POST["email"]
        username = request.POST["username"]
        password = request.POST["password1"]
        comp = request.POST["password2"]

        if password != comp:
            ctx = {
                'registered_successfully': False,
                'error': True,
                'err_msg': "Passwords don't match",
            }
            inner_html = render_to_string('pages/register.html', ctx, request=request)
            return JsonResponse({'innerHtml': inner_html})

        try:
            file = request.FILES["file"]
        except MultiValueDictKeyError:
            file = None

        try:
            pong_user = PongUser.objects.create_user(
                email=email,
                username=username,
                password=password,
                profile_picture=file
            )
            pong_user.save()
        except:
            ctx = {
                'registered_successfully': False,
                'error': True,
                'err_msg': "Email already in use",
            }
            inner_html = render_to_string('pages/register.html', ctx, request=request)
            return JsonResponse({'innerHtml': inner_html})

        ctx = {
            'registered_successfully': True,
            'username': username
        }
        inner_html = render_to_string('pages/register.html', ctx, request=request)
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


@receiver(user_logged_out)
def on_logout(sender, request, user, **kwargs):
    user.online = False
    user.save()
