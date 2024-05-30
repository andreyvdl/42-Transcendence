document.getElementById('accept-btn').addEventListener('click', (event) => {
    const userToAccept = event.target.className
    const url = "http://localhost:8000/pages/answer_friend_request/" + userToAccept

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'n'
        })
    })
})

document.getElementById('decline-btn').addEventListener('click', (event) => {
    const userToAccept = event.target.className
    const url = "http://localhost:8000/pages/answer_friend_request/" + userToAccept

    fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            'ans': 'n'
        })
    })
})
