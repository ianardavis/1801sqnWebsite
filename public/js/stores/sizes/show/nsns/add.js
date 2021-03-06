window.addEventListener( "load", function () {
    enable_button('nsn_add');
    addFormListener(
        'nsn_add',
        'POST',
        '/nsns',
        {onComplete: getNSNs}
    );
    addListener('sel_nsn_groups', getNSNClassifications, 'change');
    modalOnShow('nsn_add', getNSNGroups);
    modalOnShow('nsn_add', getNSNCountries);
});