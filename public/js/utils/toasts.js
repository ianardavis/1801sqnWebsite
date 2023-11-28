var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
  return new bootstrap.Toast(toastEl)
});
function alertToast(message) {
    const toastEl = document.querySelector('#toast_alert');
    const toast = bootstrap.Toast.getInstance(toastEl);
    if (toast) {
        setInnerText('alert_text', message);
        toast.show();
    };
};