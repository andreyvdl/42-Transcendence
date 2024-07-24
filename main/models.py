from django.utils import timezone
from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser


class PongUser(AbstractUser):
    online = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    email = models.EmailField(unique=True)

    def get_username(self):
        return self.username

    def get_id(self):
        return self.id

    def get_matches(self):
        p_id = self.get_id()
        return Match.objects.filter(Q(left_player=p_id) | Q(right_player=p_id))

    def get_tournaments(self):
        from tournament.models import Tournament
        p_id = self.get_id()
        return Tournament.objects.filter( Q(tournament_winner=p_id) )

    def get_wins(self):
        return self.get_matches().filter(winner=self.get_id())

    def get_losses(self):
        return self.get_matches().exclude(winner=self.get_id())

    def get_winrate(self):
        wins = self.get_wins().count()
        matches = self.get_matches().count()

        if matches == 0:
            return "-"
        porcentage = round( (float(wins) / matches) * 100, 1 )
        return str(porcentage) + "%"


class Match(models.Model):
    left_player = models.ForeignKey(PongUser,
                                    on_delete=models.CASCADE,
                                    related_name="left_match")
    right_player = models.ForeignKey(PongUser,
                                     on_delete=models.CASCADE,
                                     related_name="right_match")
    winner = models.ForeignKey(PongUser, on_delete=models.CASCADE)
    score = models.CharField(max_length=3)
    date = models.DateTimeField(auto_now=False, auto_now_add=False, default=timezone.now)
    game_type = models.CharField(max_length=4)
    game_mode = models.CharField(max_length=10)

    def __str__(self):
        return (f"{self.left_player.username} VS {self.right_player.username} => {self.score}"
                f", the winner was {self.winner}")


class Friendship(models.Model):
    sent_by = models.ForeignKey(PongUser, on_delete=models.CASCADE, related_name="sent_by")
    sent_to = models.ForeignKey(PongUser, on_delete=models.CASCADE, related_name="sent_to")
    status = models.CharField(max_length=1, default='p')

    class Meta:
        unique_together = ('sent_by', 'sent_to')

    def __str__(self):
        return f"{self.sent_by.username} sent a friend request to {self.sent_to.username}"
