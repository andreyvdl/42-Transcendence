from django.db import transaction
from django.test import TestCase, Client
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from .models import PongUser, Friendship


class AnswerFriendRequestTest(TestCase):

    def setUp(self):
        self.sent_by = PongUser.objects.create_user(username='fabin', password='password1')
        self.sent_to = PongUser.objects.create_user(username='reinan', password='password2')
        self.url = reverse('answer_friend_request', kwargs={'username': self.sent_to.username})

        self.friendship = Friendship.objects.create(sent_by=self.sent_by,
                                                    sent_to=self.sent_to)

        self.client = Client()
        self.client.login(username='fabin', password='password1')

    def test_get(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'error': 'Expected POST'}
        )

    def test_not_send_ans(self):
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'error': 'Expected an \'ans\' field on json.'}
        )

    def test_send_invalid_ans(self):
        response = self.client.post(self.url, data={'ans': 'x'})

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'error': 'Invalid answer'},
        )

    def test_accept_friend(self):
        response = self.client.post(self.url, data={'ans': 'y'})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'friendship': self.sent_to.id}
        )
        self.friendship.refresh_from_db()
        self.assertEqual(self.friendship.status, 'y')

    def test_decline_friend(self):
        response = self.client.post(self.url, data={'ans': 'n'})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'friendship': self.sent_to.id}
        )
        with self.assertRaises(ObjectDoesNotExist):
            Friendship.objects.get(pk=1)

    def test_accept_invalid_user(self):
        url = reverse('answer_friend_request', kwargs={'username': 'user_that_doesnt_exist'})
        response = self.client.post(url, data={'ans': 'y'})

        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'error': 'That user doesn\'t exist.'}
        )

    def test_user_not_logged_in(self):
        self.client.logout()
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, f'/pages/login?next={self.url}')

    def test_adding_same_user_twice(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Friendship.objects.create(sent_by=self.sent_by, sent_to=self.sent_to)
                Friendship.objects.create(sent_by=self.sent_to, sent_to=self.sent_by)