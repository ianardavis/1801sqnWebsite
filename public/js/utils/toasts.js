var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl)
});
function alert_toast(message) {
    let toastEl = document.querySelector('#toast_alert'),
        toast = bootstrap.Toast.getInstance(toastEl);
    if (toast) {
        set_innerText('alert_text', message);
        toast.show();
    };
};