function viewNSNEdit() {
    get({
        table: 'nsn',
        query: [`nsn_id=${path[2]}`]
    })
    .then(function ([nsn, options]) {
        getNSNGroups({
            selected: nsn.nsn_group_id,
            selected_classification: nsn.nsn_class_id
        });
        getNSNCountries({
            selected: nsn.nsn_country_id
        });
        set_value({id: 'item_number_edit', value: nsn.item_number});
    })
};
window.addEventListener( "load", function () {
    enable_button('nsn_edit');
    addFormListener(
        'nsn_edit',
        'PUT',
        `/nsns/${path[2]}`,
        {
            onComplete: [
                getNSN,
                function () {$('#mdl_nsn_edit').modal('hide')}
            ]
        }
    );
    let groups = document.querySelector('#sel_nsn_groups');
    if (groups) groups.addEventListener('change', getNSNClassifications);
    $('#mdl_nsn_edit').on('show.bs.modal', viewNSNEdit);
});