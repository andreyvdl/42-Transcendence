function submitFormLogin(event) {
    event.preventDefault();

    const url = "http://localhost:8000/pages/login";
    const csrftoken = getCookie('csrftoken');
    const formLogin = document.getElementById('formLogin');
    const formData = new FormData(formLogin);

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData,
    })
        .then((response) => {
            if (response.ok || response.status == 302)
                return response.json();
            else
                return new Error(response.Error);
        })
        .then((data) => {
            if (data.redirect)
                handleRedirect(data.redirect);
            else if (data.innerHtml)
                updatePage(data.innerHtml);
        })
        .catch(error => console.log(error));
}

function loginPageSetup() {
    const formLogin = document.getElementById('formLogin');

    attachEvent(formLogin, 'submit', submitFormLogin);
}
