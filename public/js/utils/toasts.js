var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl)
});
function alert_toast(message) {
    const toastEl = document.querySelector('#toast_alert');
    const toast = bootstrap.Toast.getInstance(toastEl);
    if (toast) {
        set_innerText('alert_text', message);
        toast.show();
    };
};