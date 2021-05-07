window.addEventListener( "load", function () {
    enable_button('nsn_add');
    addFormListener(
        'nsn_add',
        'POST',
        '/nsns',
        {onComplete: getNSNs}
    );
    let groups = document.querySelector('#sel_nsn_groups');
    if (groups) groups.addEventListener('change', getNSNClassifications);
    modalOnShow('nsn_add', getNSNGroups);
    modalOnShow('nsn_add', getNSNCountries);
});