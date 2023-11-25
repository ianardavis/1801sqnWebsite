window.addEventListener( "load", function () {
    enableButton('contact_add');
    addFormListener(
        'contact_add',
        'POST',
        '/contacts',
        {onComplete: getContacts}
    );
});