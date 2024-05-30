from datetime import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser

DEFAULT_ICON = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/7.png"


class PongUser(AbstractUser):
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    avatar = models.CharField(default=DEFAULT_ICON)

    def get_wins(self):
        return self.wins

    def get_losses(self):
        return self.losses

    def get_avatar(self):
        return self.avatar


class Match(models.Model):
    left_player = models.ForeignKey(PongUser,
                                    on_delete=models.CASCADE,
                                    related_name="left_match")
    right_player = models.ForeignKey(PongUser,
                                     on_delete=models.CASCADE,
                                     related_name="right_match")
    winner = models.ForeignKey(PongUser, on_delete=models.CASCADE)
    score = models.CharField(max_length=3)
    date = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime.now)

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
