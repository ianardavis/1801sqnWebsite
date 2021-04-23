window.addEventListener( "load", function () {
    enable_button('address_add');
    addFormListener(
        'address_add',
        'POST',
        '/addresses',
        {onComplete: getAddresses}
    );
});