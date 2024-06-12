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

function attachEvent(element, event, handler) {
    if (element) {
        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);
    }
}

function updatePage(innerHtml) {
    document.getElementById('mainContent').innerHTML = innerHtml;
}