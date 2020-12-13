var event_listeners = [];
function getNSNEdit(nsn_id) {
    get(
        function(nsn, options) {
            set_attribute({id: 'nsn_edit_cancel',   attribute: 'href',  value: `javascript:getNSNEdit('${nsn.nsn_id}')`});
            set_attribute({id: '_item_number_edit', attribute: 'value', value: nsn._item_number});
            getNSNGroups({
                select:                  'edit',
                selected:                nsn.nsn_group_id,
                selected_classification: nsn.nsn_classification_id
            });
            getNSNCountries({
                select:   'edit',
                selected: nsn.nsn_country_id
            });
            addFormListener(
                'form_nsn_edit',
                'PUT',
                `/stores/nsns/${nsn.nsn_id}`,
                {
                    onComplete: [
                        getNSNs,
                        function () {$('#mdl_nsn_view').modal('hide')}
                    ]
                },
                true
            );
        },
        {
            table: 'nsn',
            query: [`nsn_id=${nsn_id}`]
        }
    );
};
function edit_nsn_reset() {
    hide('div_nsn_edit');
    show('btn_nsn_edit');
    show('div_nsn_view');
    let return_to_stack = [];
    while (event_listeners.length !== 0) {
        let listener = event_listeners.pop(),
            element  = document.querySelector(`#${listener.id}`);
        if (element) {
            if (element.id === 'form_nsn_edit') element.removeEventListener('submit', listener.function)
            else                                return_to_stack.push(listener);
        };
    };
    event_listeners = return_to_stack;
};
function edit_nsn() {
    show('div_nsn_edit');
    hide('btn_nsn_edit');
    hide('div_nsn_view');
};
let groups = document.querySelector('#nsn_group_id_edit');
if (groups) groups.addEventListener('change', function () {
    getNSNClassifications({select: 'edit'});
});
$('#mdl_nsn_view').on('show.bs.modal', function(event) {
    edit_nsn_reset();
    getNSNEdit(event.relatedTarget.dataset.nsn_id);
});