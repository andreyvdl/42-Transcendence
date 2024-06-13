import json
import base64

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
from core.settings import DEFAULT_AVATAR


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
    return JsonResponse({'innerHtml': render_to_string('home.html')})

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
        inner_html = render_to_string('account.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        new_username = request.POST['new_username'].strip()
        if PongUser.objects.filter(username=new_username).exists():
            ctx = {
                'username': request.user.username,
                'wins': request.user.get_wins(),
                'losses': request.user.get_losses(),
                'picture_url': _get_profile_pic(request.user),
                'hide_form': True,
                'msg': '🔴 User already exists.'
            }
        else:
            curr_user = PongUser.objects.get(username=request.user)
            curr_user.username = new_username
            curr_user.save()
            ctx = {
                'username': curr_user.username,
                'wins': curr_user.get_wins(),
                'losses': curr_user.get_losses(),
                'picture_url': _get_profile_pic(request.user),
                'hide_form': True,
                'msg': '🟢 Username changed successfully.'
            }

        inner_html = render_to_string('account.html', ctx)
        return JsonResponse({'innerHtml': inner_html})


class LoginView(View):
    @staticmethod
    def get(request):
        if not _ajax(request):
            return render(request, 'base.html')
        if request.user.is_authenticated:
            return JsonResponse({'redirect': reverse('account')}, status=302)
        return JsonResponse({'innerHtml': render_to_string('login.html', request=request)})

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
            # return redirect('account')
        ctx = {'err': True, 'err_msg': "Invalid username or password"}
        inner_html = render_to_string('login.html', ctx, request=request)
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
        inner_html = render_to_string('register.html', request=request)
        return JsonResponse({'innerHtml': inner_html})

    @staticmethod
    def post(request):
        username = request.POST["username"]
        password = request.POST["password1"]

        try:
            file = request.FILES["file"]
        except MultiValueDictKeyError:
            file = None

        pong_user = PongUser.objects.create_user(
            username,
            password=password,
            profile_picture=file
        )
        pong_user.save()
        ctx = {
            'registered_successfully': True,
            'username': username
        }
        inner_html = render_to_string('register.html', ctx, request=request)
        return JsonResponse({'innerHtml': inner_html})
