function viewNSNEdit() {
    get({
        table: 'nsn',
        query: [`"nsn_id":"${path[2]}"`]
    })
    .then(function ([nsn, options]) {
        getNSNGroups({
            selected: nsn.nsn_group_id,
            selected_classification: nsn.nsn_class_id
        });
        getNSNCountries({
            selected: nsn.nsn_country_id
        });
        set_value({id: 'nsn_item_number_edit', value: nsn.item_number});
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
                function () {modalHide('nsn_edit')}
            ]
        }
    );
    addListener('sel_nsn_groups', getNSNClassifications, 'change');
    modalOnShow('nsn_edit', viewNSNEdit);
});