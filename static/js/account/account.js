function changeUsername(event) {
    event.preventDefault();

    const url = BASE_URL + "/auth/account";
    const formChangeUsername = document.getElementById('formChangeUsername');
    const formData = new FormData(formChangeUsername);

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData,
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data.innerHtml)
                updatePage(data.innerHtml);
        })
        .catch((error) => {
            console.error(error);
        });
}

function sendFriendRequest(event) {
    event.preventDefault();

    const url = BASE_URL + '/api/make_friends/' + friend + '/';
    const friendToAddTextField = document.getElementById('friend-text-field');
    const friend = friendToAddTextField.value;

    fetch(url, {
        method: 'POST'
    })
};

function acceptFriendRequest(event) {
    event.preventDefault();

    const userToAccept = event.target.className
    const url = BASE_URL + "/api/answer_friend_request/" + userToAccept

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'y'
        })
    })
};

function declineFriendRequest(event) {
    event.preventDefault();

    const userToDecline = event.target.className
    const url = BASE_URL + "/api/answer_friend_request/" + userToDecline

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'n'
        })
    })
        .then((response) => {
            if (response.ok)
                return response.json();
            else
                return new Error(response.status);
        })
        .then((data) => {
            if (data.redirect) {
                handleRedirect(data.redirect);
            }
        })
};

function logout(event) {
    event.preventDefault();

    const url = BASE_URL + '/auth/logout';

    fetch(url, {
        method: 'POST'
    })
        .then((response) => {
            if (response.ok || response.status == 302)
                return response.json();
            else
                return new Error(response.status);
        })
        .then((data) => {
            if (data.redirect)
                handleRedirect(data.redirect);
        })
        .catch(error => console.error(error));
};

function userOnline() {
    const url = BASE_URL + '/api/online';

    fetch(url, {
        method: 'POST'
    })
}

function userOffline() {
    const url = BASE_URL + '/api/offline';

    fetch(url, {
        method: 'POST'
    })
}

export default function accountPageSetup() {
    const acceptBtn = document.getElementById('accept-btn');
    const declineBtn = document.getElementById('decline-btn');
    const addFriend = document.getElementById('add-friend-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const changeUsernameForm = document.getElementById('formChangeUsername');

    userOnline();

    attachEvent(acceptBtn, 'click', acceptFriendRequest);
    attachEvent(declineBtn, 'click', declineFriendRequest);
    attachEvent(addFriend, 'click', sendFriendRequest);
    attachEvent(logoutBtn, 'click', logout);
    attachEvent(changeUsernameForm, 'submit', changeUsername);

    attachEvent(window, 'beforeunload', userOffline);
}
