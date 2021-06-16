function alert(message = '') {
    document.querySelectorAll('.alert').forEach(e => e.innerText = message);
    if (message) setTimeout(alert, 3000);
};