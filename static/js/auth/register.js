function submitFormRegister(event) {
    event.preventDefault();

    const url = `${BASE_URL}/auth/register`;
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
                updatePage(data.innerHtml);
            else {
                const toast = document.getElementById("liveToast");
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
                const toastTitle = document.querySelector("strong.me-auto");
                const toastBody = document.querySelector("div.toast-body");

                toastTitle.innerHTML = data.title;
                toastBody.innerHTML = data.text;
                toastBootstrap.show();
            }
        })
        .catch((error) => console.error(error));
}

export default function registerPageSetup() {
    const formRegister = document.getElementById('formRegister');
    const intraLink = document.getElementById('intraLink');

    if (intraLink) intraLink.href = INTRA_URL;

    attachEvent(formRegister, 'submit', submitFormRegister);
}
