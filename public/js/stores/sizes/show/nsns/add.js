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
    $('#mdl_nsn_add').on('show.bs.modal', getNSNGroups);
    $('#mdl_nsn_add').on('show.bs.modal', getNSNCountries);
});