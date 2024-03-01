function countBalance() {
    let total = 0.0;
    document.querySelectorAll('.balance').forEach(e => {
        total += Number(e.value);
    });
    set_innerText('balance_total', `£${total.toFixed(2)}`);
};
function clearAllBalances() {
    document.querySelectorAll('.balance').forEach(e => e.value = '');
    countBalance();
};
window.addEventListener('load', function () {
    addListener('balance_reset', clearAllBalances)
    document.querySelectorAll('.balance').forEach(e => e.addEventListener('input', countBalance))
});