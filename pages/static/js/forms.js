// https://docs.djangoproject.com/en/4.1/howto/csrf/#using-csrf-protection-with-ajax
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function handleRedirect(url) {
    window.history.pushState({}, "", url);
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
        .catch(error => console.log(`Error: ${error}, status: ${error.status}`));
};

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
            if (data['redirect'])
                handleRedirect(data.redirect);
            else if (data.innerHtml)
                document.getElementById('mainContent').innerHTML = data.innerHtml;
        })
        .catch(error => console.log(error));
}

function submitFormRegister(event) {
    event.preventDefault();

    const url = "http://localhost:8000/pages/register";
    const csrftoken = getCookie('csrftoken');
    const formRegister = document.getElementById('formRegister');
    const formData = new FormData(formRegister);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
        },
        body: formData,
    })
        .then((response) => {
            if (!response.ok)
                return new Error(response.Error);
            return response.json();
        })
        .then((data) => {
            if (data.innerHtml)
            document.getElementById('mainContent').innerHTML = data.innerHtml;
        })
        .catch((error) => console.error(error));
}
