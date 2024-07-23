from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import PongUser

class PongUserCreationForm(UserCreationForm):
	email = forms.EmailField(required=True)

	class Meta:
		model = PongUser
		fields = ("username", "email", "password1", "password2")

	def clean_email(self):
		email = self.cleaned_data.get("email")
		if PongUser.objects.filter(email=email).exists():
			raise forms.ValidationError("Email already in use.")
		return email

	def clean_username(self):
		username = self.cleaned_data.get("username").strip()
		if PongUser.objects.filter(username=username).exists():
			raise forms.ValidationError("Username already in use.")
		elif len(username) > 25:
			raise forms.ValidationError("Username can't have more than 25 characters.")
		return username
