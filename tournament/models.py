from django.db import models
from datetime import datetime
from main.models import PongUser
from django.contrib.postgres.fields import ArrayField

class TournamentMatch(models.Model):
    match_round = models.IntegerField()
    player_one = models.CharField(max_length=50)
    player_two = models.CharField(max_length=50)
    winner = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.player_one} vs {self.player_two}"

# Create your models here.
class Tournament(models.Model):
    curr_round = models.IntegerField(default=0)
    players = ArrayField(models.CharField(max_length=50), blank=True)
    winner = models.ForeignKey(PongUser, on_delete=models.CASCADE, related_name="winner", null=True)
    date = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime.now)
    round_matches = models.ManyToManyField(TournamentMatch)

    def __str__(self):
        return str(self.players)