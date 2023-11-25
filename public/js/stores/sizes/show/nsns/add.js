const enable_add_nsn = enableButton('add_nsn');
window.addEventListener( "load", function () {
    addFormListener(
        'nsn_add',
        'POST',
        '/nsns',
        {onComplete: getNSNs}
    );
    add_listener('sel_nsn_groups', getNSNClassifications, 'change');
    modalOnShow('nsn_add', getNSNGroups);
    modalOnShow('nsn_add', getNSNCountries);
});