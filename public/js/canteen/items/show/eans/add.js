function AddEAN(ean, result) {
    console.log(ean, result);
    setValue('inp_ean_add', ean);
};
window.addEventListener('load', function () {
    modalOnShow('loancard_open', function () {StartScanning(AddEAN)});
    modalOnHide('loancard_open', StopScanning);
    addFormListener(
        'ean_add',
        'POST',
        '/eans',
        {onComplete: [getEANs]}
    );
});