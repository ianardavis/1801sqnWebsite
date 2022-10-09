window.addEventListener( "load", function () {
    enable_button('contact_add');
    addFormListener(
        'contact_add',
        'POST',
        '/contacts',
        {onComplete: getContacts}
    );
});