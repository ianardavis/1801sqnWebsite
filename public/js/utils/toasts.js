function showToast(title, text = 'Processing request...', showClose = false) {
    const id = random_id();
    const toast = new Toast(id, title, text, showClose).e;
    let div_toasts = document.getElementById('div_toasts');
    div_toasts.appendChild(toast);
    const toastBootstrap = new bootstrap.Toast(toast);
    toastBootstrap.show();
    return id;
};
function hideToast(id) {
    removeID(`toast_${id}`);
};
function updateToast(id, event) {
    getElement(`toast_${id}`)
    .then(toast => {
        // let body = toast.querySelector('.toast-body');
        // if (body) body.appendChild('<br>Added Text!')
    })
};