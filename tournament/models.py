from django.db import models
from datetime import datetime
from main.models import PongUser
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class Tournament(models.Model):
    players = ArrayField(models.CharField(max_length=50), blank=True)
    winner = models.ForeignKey(PongUser, on_delete=models.CASCADE, related_name="winner", null=True)
    date = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime.now)

    def __str__(self):
        return str(self.players)