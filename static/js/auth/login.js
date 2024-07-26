function submitFormLogin(event) {
    event.preventDefault();

    const url = `${BASE_URL}/auth/login`;
    const formLogin = document.getElementById('formLogin');
    const formData = new FormData(formLogin);

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
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
			else
				toastCall(data);
        })
        .catch(error => console.log(error));
}

export default function loginPageSetup() {
    const formLogin = document.getElementById('formLogin');

    attachEvent(formLogin, 'submit', submitFormLogin);
}
