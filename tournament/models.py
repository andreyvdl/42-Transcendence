from django.db import models
from datetime import datetime
from main.models import PongUser
from django.contrib.postgres.fields import ArrayField


class Tournament(models.Model):
    upper_bracket_players = ArrayField(models.CharField(max_length=50))
    lower_bracket_players = ArrayField(models.CharField(max_length=50))
    upper_bracket_winner = models.CharField(max_length=50, default="")
    lower_bracket_winner = models.CharField(max_length=50, default="")
    tournament_winner = models.ForeignKey(PongUser, on_delete=models.CASCADE, related_name="winner", null=True)
    date = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime.now)

    def __str__(self):
        return str(f"Upper bracket: {self.upper_bracket_players}\nLower bracket players: {self.lower_bracket_players}")

    def get_winner(self):
        return (self.tournament_winner if self.tournament_winner is not None else "")