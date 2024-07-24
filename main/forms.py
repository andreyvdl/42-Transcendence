from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import PongUser
import re

#Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.
class PongUserCreationForm(UserCreationForm):
	email = forms.EmailField(required=True)

	class Meta:
		model = PongUser
		fields = ("username", "email", "password1", "password2")

	def clean_email(self):
		email = self.cleaned_data.get("email")
		emoji_pattern = re.compile(
			"["
			"\U0001F600-\U0001F64F" # emoticons
			"\U0001F300-\U0001F5FF" # symbols & pictographs
			"\U0001F680-\U0001F6FF" # transport & map symbols
			"\U0001F1E0-\U0001F1FF" # flags (iOS)
			"\U00002700-\U000027BF" # Dingbats
			"\U000024C2-\U0001F251"
			"]+", flags=re.UNICODE
		)

		if emoji_pattern.search(email):
			raise form.ValidationError("Email can't have emoji")
		return email

	def clean_username(self):
		username = self.cleaned_data.get("username").strip()
		username = username.encode()
		if len(username) > 16:
			raise forms.ValidationError("Username can't have more than 16 characters.")
		username = username.decode()
		return username
