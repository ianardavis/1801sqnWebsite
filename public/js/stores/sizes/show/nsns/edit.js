function getNSNEdit(nsn_id) {
    get(
        function(nsn, options) {
            set_attribute({id: 'nsn_edit_cancel', attribute: 'href',  value: `javascript:getNSNEdit('${nsn.nsn_id}')`});
            set_attribute({id: '_item_number',    attribute: 'value', value: nsn._item_number});
            set_innerText({id: '_nsn_view',       text: print_nsn(nsn)});
            set_innerText({id: '_default',        text: yesno((nsn.nsn_id === nsn.size.nsn_id))});
            getNSNGroups({
                select:                  'edit',
                selected:                nsn.nsn_group_id,
                selected_classification: nsn.nsn_classification_id
            });
            getNSNCountries({
                select:   'edit',
                selected: nsn.nsn_country_id
            });
        },
        {
            table: 'nsn',
            query: [`nsn_id=${nsn_id}`]
        }
    );
};
function edit_reset() {
    hide('div_nsn_edit');
    show('btn_nsn_edit');
    show('div_nsn_view');
};
function edit_nsn() {
    show('div_nsn_edit');
    hide('btn_nsn_edit');
    hide('div_nsn_view');
}
let groups = document.querySelector('#nsn_group_id_edit');
if (groups) groups.addEventListener('change', function () {
    getNSNClassifications({
        select: 'edit'
    })
});
$('#mdl_nsn_view').on('show.bs.modal', function(event) {
    edit_reset();
    getNSNEdit(event.relatedTarget.dataset.nsn_id);
});