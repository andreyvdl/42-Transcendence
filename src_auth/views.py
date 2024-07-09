import os
import requests

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.datastructures import MultiValueDictKeyError
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from datetime import datetime
from main.models import PongUser


def _ajax(request):
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


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


@csrf_exempt
@login_required(login_url='login')
def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Expected POST'}, status=400)
    request.user.online = False
    request.user.save()
    logout(request)
    return JsonResponse({'redirect': reverse('login')}, status=302)


def _call_api(user_code):
    if user_code is None:
        return None, 'Error on API response'

    data = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv('INTRA_UID'),
        'client_secret': os.getenv('INTRA_SECRET'),
        'code': user_code,
        'redirect_uri': os.getenv('INTRA_REDIRECT'),
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
