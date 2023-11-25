window.addEventListener( "load", function () {
    enableButton('address_add');
    addFormListener(
        'address_add',
        'POST',
        '/addresses',
        {onComplete: getAddresses}
    );
});