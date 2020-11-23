function numberBtn(num) {
    if ($('#complete_sale').hasClass('show') && $('#btn_close_complete_sale').hasClass('hidden')) {
        let tendered = document.querySelector('#_tendered'),
            amt = Number(String(tendered.value).replace('.', '').replace('£', ''));
        if (amt === 0) {
            amt = String(num);
        } else {
            amt += String(num);
        };
        set_tendered(amt);
    };
};
function backspace() {
    if ($('#complete_sale').hasClass('show') && $('#btn_close_complete_sale').hasClass('hidden')) {
        let tendered = document.querySelector('#_tendered'),
            amt = Number(String(tendered.value).replace('.', ''));
            amt = String(amt);
        set_tendered(amt.substring(0, amt.length - 1))
    };
};
function set_tendered(amt) {
    amt = String(amt).padStart(3, '0');
    amt = amt.substring(0, amt.length - 2) + "." + amt.substring(amt.length - 2);
    let tendered = document.querySelector('#_tendered');
    tendered.value = amt;
};
function reset() {
    let close    = document.querySelector('#btn_close_complete_sale'),
        complete = document.querySelector('#btn_complete_sale'),
        change   = document.querySelector('#change'),
        tendered = document.querySelector('#_tendered');
    close.classList.add('hidden');
    complete.classList.remove('hidden');
    change.innerText = '';
    tendered.value = '0.00';
};
let btn_finish = document.querySelector('#btn_finish');
if (btn_finish) btn_finish.addEventListener('click', function () {$('#complete_sale').modal('show')});
window.addEventListener('keydown', function (e) {
    if (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) {
        numberBtn(e.key)
    } else if (e.key === 'Backspace') {
        backspace();
    };
});
function clear_alert() {
    let alerts = document.querySelectorAll('.alert_pos');
    alerts.forEach(e => e.innerText = '');
};
function alert(message) {
    let alerts = document.querySelectorAll('.alert_pos');
    alerts.forEach(e => e.innerText = message);
    setTimeout(clear_alert, 3000);
};