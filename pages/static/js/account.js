const PREFIX = "http://localhost:8000/"

function handleRedirect(url) {
    window.history.pushState({path:url}, "", url);
    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
        .then(response => {
            if (!response.ok)
                return new Error(response.status);
            return response.json();
        })
        .then(data => {
            if (data.innerHtml)
                document.getElementById('mainContent').innerHTML = data.innerHtml;
        })
        .catch(error => console.log(error));
};

function changeUsername(event) {
    event.preventDefault();

    const url = "http://localhost:8000/pages/account";
    const formChangeUsername = document.getElementById('formChangeUsername');
    const formData = new FormData(formChangeUsername);

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data.innerHTML)
                document.getElementById('mainContent').innerHTML = data.innerHtml;
        })
        .catch((error) => {
            console.error(error);
        });
}

function sendFriendRequest(event) {
    event.preventDefault();

    const friendToAddTextField = document.getElementById('friend-text-field');
    const friend = friendToAddTextField.value;
    const url = PREFIX + 'pages/make_friends/' + friend + '/';

    fetch(url, {
        method: 'POST'
    })
};

function acceptFriendRequest(event) {
    event.preventDefault();

    const userToAccept = event.target.className
    const url = "http://localhost:8000/pages/answer_friend_request/" + userToAccept

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
    const url = "http://localhost:8000/pages/answer_friend_request/" + userToDecline

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

    const url = PREFIX + 'pages/logout';

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