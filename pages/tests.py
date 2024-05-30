from django.test import TestCase, Client
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import IntegrityError
from .models import PongUser, Friendship


class AnswerFriendRequestTest(TestCase):

    def setUp(self):
        self.user1 = PongUser.objects.create_user(username='user1', password='password1')
        self.user2 = PongUser.objects.create_user(username='user2', password='password2')
        self.url = reverse('answer_friend_request', kwargs={'username': self.user2.username})

        self.friendship = Friendship.objects.create(user1=self.user1,
                                                    user2=self.user2,
                                                    sent_by=self.user1)

        self.client = Client()
        self.client.login(username='user1', password='password1')

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
            expected_data={'friendship': self.user2.id}
        )
        self.friendship.refresh_from_db()
        self.assertEqual(self.friendship.status, 'y')

    def test_decline_friend(self):
        response = self.client.post(self.url, data={'ans': 'n'})

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf-8'),
            expected_data={'friendship': self.user2.id}
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

    def test_adding_same_user_twice(self):  # @TODO Move this to another test case, does not belong to answer friend
        with self.assertRaises(IntegrityError):
            Friendship.objects.create(user1=self.user1,
                                      user2=self.user2,
                                      sent_by=self.user1)
