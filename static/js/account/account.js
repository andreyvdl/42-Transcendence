function changeUsername(event) {
    event.preventDefault();

    const url = `${BASE_URL}/account/`;
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
            else 
				toastCall(data);
        })
        .catch((error) => {
            console.error(error);
        });
}

function changePicture(event) {
    event.preventDefault();

    const url = `${BASE_URL}/api/update_picture/`;
    const formChangePicture = document.getElementById('formChangePicture');
    const formData = new FormData(formChangePicture);

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
            else
				toastCall(data);
        })
        .catch((error) => {
            console.error(error);
        });
}

function sendFriendRequest(event) {
    event.preventDefault();

    const friendToAddTextField = document.getElementById('friend-text-field');
    const friend = friendToAddTextField.value;
    const url = `${BASE_URL}/api/make_friends/${friend}/`;

    if (friend === "") {
		toastCall({title: "🔴 ERROR", text: "No username given."});
        return;
    }

    fetch(url, {
        method: 'POST'
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
			toastCall(data);
        })
        .catch((error) => {
            console.error(error);
        });
};

function acceptFriendRequest(event) {
    event.preventDefault();

    const userToAccept = event.target.value
    const url = `${BASE_URL}/api/answer_friend_request/${userToAccept}`;

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'y'
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data.innerHtml)
                updatePage(data.innerHtml);
            else {
                const obj = document.getElementById(event.target.name);

                if (data.title.includes("SUCCESS")) {
                    obj.removeChild(obj.children[obj.children.length - 1]);
                    obj.removeChild(obj.children[obj.children.length - 1]);
                }
				toastCall(data);
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

function declineFriendRequest(event) {
    event.preventDefault();

    const userToDecline = event.target.value
    const url = `${BASE_URL}/api/answer_friend_request/${userToDecline}`;

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'n'
        })
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (data.innerHtml)
                updatePage(data.innerHtml);
            else {
                const obj = document.getElementById(event.target.name);

                if (data.title.includes("SUCCESS")) {
                    obj.removeChild(obj.children[obj.children.length - 1]);
                    obj.removeChild(obj.children[obj.children.length - 1]);
                }
				toastCall(data);
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

function logout(event) {
    event.preventDefault();

    const url = `${BASE_URL}/auth/logout`;

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
}

function userOnline() {
    const url = `${BASE_URL}/api/online`;

    fetch(url, {
        method: 'POST'
    })
}

function userOffline() {
    const url = `${BASE_URL}/api/offline`;

    fetch(url, {
        method: 'POST'
    })
}

export default function accountPageSetup() {
    const acceptBtn = document.getElementsByClassName('botao-de-aceitar');
    const declineBtn = document.getElementsByClassName('botao-de-recusar');
    const addFriend = document.getElementById('add-friend-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const changeUsernameForm = document.getElementById('formChangeUsername');
    const changePictureForm = document.getElementById('formChangePicture')

    userOnline();

    for (let btn of acceptBtn) {
        attachEvent(btn, 'click', acceptFriendRequest);
    }
    for (let btn of declineBtn) {
        attachEvent(btn, 'click', declineFriendRequest);
    }
    attachEvent(addFriend, 'click', sendFriendRequest);
    attachEvent(logoutBtn, 'click', logout);
    attachEvent(changeUsernameForm, 'submit', changeUsername);
    attachEvent(changePictureForm, 'submit', changePicture);

	attachEvent(window, 'beforeunload', userOffline);
}
