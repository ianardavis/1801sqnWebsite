window.addEventListener( "load", function () {
    $('#mdl_nsn_add').on('show.bs.modal', getNSNGroups);
    $('#mdl_nsn_add').on('show.bs.modal', getNSNCountries);
    remove_attribute({id: 'btn_nsn_add', attribute: 'disabled'});
    let groups = document.querySelector('#nsn_group_id_add');
    if (groups) groups.addEventListener('change', getNSNClassifications);
    addFormListener(
        'form_nsn_add',
        'POST',
        '/stores/nsns',
        {onComplete: getNSNs}
    );
});