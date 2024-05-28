from django.db import models
from django.contrib.auth.models import AbstractUser

DEFAULT_ICON = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/7.png"

class PongUser(AbstractUser):
    wins = models.IntegerField(default = 0)
    losses = models.IntegerField(default = 0)
    avatar = models.CharField(default = DEFAULT_ICON)

    def get_wins(self):
        return self.wins

    def get_losses(self):
        return self.losses

    def get_avatar(self):
        return self.avatar
