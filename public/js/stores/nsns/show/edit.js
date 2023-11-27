function viewNSNEdit() {
    get({
        table: 'nsn',
        where: {nsn_id: path[2]}
    })
    .then(function ([nsn, options]) {
        getNSNGroups({
            selected: nsn.nsn_group_id,
            selected_classification: nsn.nsn_class_id
        });
        getNSNCountries({
            selected: nsn.nsn_country_id
        });
        setValue('nsn_item_number_edit', nsn.item_number);
    })
};
window.addEventListener( "load", function () {
    enableButton('nsn_edit');
    addFormListener(
        'nsn_edit',
        'PUT',
        `/nsns/${path[2]}`,
        {
            onComplete: [
                getNSN,
                function () {modalHide('nsn_edit')}
            ]
        }
    );
    add_listener('sel_nsn_groups', getNSNClassifications, 'change');
    modalOnShow('nsn_edit', viewNSNEdit);
});