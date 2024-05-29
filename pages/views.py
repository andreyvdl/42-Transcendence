from django.http import JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from .models import PongUser, Match
from django.db.models import Q
from django.contrib.auth.decorators import login_required


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
        matches = Match.objects.filter(Q(left_player=request.user.id) | Q(right_player=request.user.id))
        ctx = {
            'username': request.user.username,
            'wins': request.user.get_wins(),
            'losses': request.user.get_losses(),
            'avatar': request.user.get_avatar(),
            'matches': matches
        }
        return render(request, "account.html", ctx)

    @staticmethod
    def post(request):
        new_username = request.POST['new_username'].strip()
        if PongUser.objects.filter(username=new_username).exists():
            ctx = {
                'username': request.user.username,
                'wins': request.user.get_wins(),
                'losses': request.user.get_losses(),
                'avatar': request.user.get_avatar(),
                'hide_form': True,
                'msg': '🔴 User already exists.'
            }
            return render(request, "account.html", ctx)
        else:
            curr_user = PongUser.objects.get(username=request.user)
            curr_user.username = new_username
            curr_user.save()
            ctx = {
                'username': curr_user.username,
                'wins': curr_user.get_wins(),
                'losses': curr_user.get_losses(),
                'avatar': curr_user.get_avatar(),
                'hide_form': True,
                'msg': '🟢 Username changed successfully.'
            }
            return render(request, "account.html", ctx)


class LoginView(View):
    @staticmethod
    def get(request):

        return render(request, "login.html")

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
            return redirect('account')
        ctx = {'err': True, 'err_msg': "Invalid username or password"}
        return render(request, "login.html", ctx)


class RegisterView(View):
    @staticmethod
    def get(request):
        return render(request, "register.html")

    @staticmethod
    def post(request):
        username = request.POST["username"]
        password = request.POST["password1"]
        # form = UserCreationForm(request.POST)

        # https://docs.djangoproject.com/en/5.0/topics/auth/default/#django.contrib.auth.forms.BaseUserCreationForm
        # if not form.is_valid():
        #     ctx = {
        #         'error': True,
        #         'err_msg': form.errors,
        #         'username': username,
        #         'password': password
        #     }
        #     return render(request, "register.html", ctx)

        pong_user = PongUser.objects.create_user(
            username,
            password=password
        )
        pong_user.save()
        ctx = {
            'registered_successfully': True,
            'username': username
        }
        return render(request, "register.html", ctx)
