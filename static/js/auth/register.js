function submitFormRegister(event) {
    event.preventDefault();

    const url = BASE_URL + "/pages/register";
    const csrftoken = getCookie('csrftoken');
    const formRegister = document.getElementById('formRegister');
    const formData = new FormData(formRegister);
    
    fetch(url, {
        method: 'POST',
		mode: 'same-origin',
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
        })
        .catch((error) => console.error(error));
}

export default function registerPageSetup() {
    const formRegister = document.getElementById('formRegister');

    attachEvent(formRegister, 'submit', submitFormRegister);
}
