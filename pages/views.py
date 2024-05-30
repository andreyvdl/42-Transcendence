from django.http import JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from .models import PongUser, Match, Friendship
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


def _get_pending_friend_requests(pk):
    self_username = PongUser.objects.get(pk=pk)
    friendships = Friendship.objects.filter((Q(user1=pk) | Q(user2=pk) & ~Q(sent_by=pk) & Q(status='p')))
    pend_friends = []
    for friend in friendships:
        pend_friends.append(friend.user2.username if not friend.user2 == self_username else friend.user1.username)

    return pend_friends


def _get_friends(pk):
    self_username = PongUser.objects.get(pk=pk)
    friendships = Friendship.objects.filter((Q(user1=pk) | Q(user2=pk) & ~Q(sent_by=pk) & Q(status='y')))
    friends = []
    for f in friendships:
        friends.append(f.user2.username if not f.user2 == self_username else f.user1.username)

    return friends


@csrf_exempt
@login_required(login_url='login')
def make_friends(request, user2: str):
    user1_username = request.user.username

    if request.user.username == user2:
        return JsonResponse({"error": "Can't send a friend request to yourself."}, status=400)
    if not PongUser.objects.filter(username=user2).exists():
        return JsonResponse({"error": "This user does not exist."}, status=400)

    user1 = PongUser.objects.get(username=user1_username)
    user2 = PongUser.objects.get(username=user2)

    friendship = Friendship.objects.create(
        user1=user1,
        user2=user2,
        sent_by=user1
    )

    return JsonResponse({"friendship": friendship.id})


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
        pend_friends = _get_pending_friend_requests(request.user.id)
        friends = _get_friends(request.user.id)
        ctx = {
            'username': request.user.username,
            'wins': request.user.get_wins(),
            'losses': request.user.get_losses(),
            'avatar': request.user.get_avatar(),
            'friends': friends,
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
