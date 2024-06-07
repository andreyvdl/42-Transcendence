const PREFIX = "http://localhost:8000/"
const acceptBtn = document.getElementById("accept-btn");
const declineBtn = document.getElementById("decline-btn");
const friendToAddTextField = document.getElementById('friend-text-field')

if (acceptBtn) {
    acceptBtn.addEventListener('click', (event) => {
        const userToAccept = event.target.className
        const url = "http://localhost:8000/pages/answer_friend_request/" + userToAccept

        fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                'ans': 'y'
            })
        })
    })
}

if (declineBtn) {
    document.getElementById('decline-btn').addEventListener('click', (event) => {
        const userToDecline = event.target.className
        const url = "http://localhost:8000/pages/answer_friend_request/" + userToDecline

        fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                'ans': 'n'
            })
        })
    })
}


document.getElementById('add-friend-btn').addEventListener('click', (event) => {
    const friend = friendToAddTextField.value
    const url = PREFIX + 'pages/make_friends/' + friend + '/'

    fetch(url, {
        method: 'POST'
    })
})

document.getElementById('logout-btn').addEventListener('click', (event) => {
    const url = PREFIX + 'pages/logout';

    fetch(url, {
        method: 'POST'
    });
});

window.addEventListener('load', () => {
    const url = PREFIX + 'pages/online';

    fetch(url, {
        method: 'POST'
    });
});

window.addEventListener('beforeunload', () => {
    const url = PREFIX + 'pages/offline';

    fetch(url, {
        method: 'POST'
    });
});
