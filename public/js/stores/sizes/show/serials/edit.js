var event_listeners = [];
function getSerialEdit(serial_id) {
    getLocations();
    get(
        function(serial, options) {
            set_attribute({id: 'serial_edit_cancel',    attribute: 'href',  value: `javascript:getSerialEdit('${serial.serial_id}')`});
            set_attribute({id: '_serial_edit',          attribute: 'value', value: serial._serial});
            set_attribute({id: 'serial_edit_locations', attribute: 'value', value: serial.location._location});
            addFormListener(
                'form_serial_edit',
                'PUT',
                `/stores/serials/${serial.serial_id}`,
                {
                    onComplete: [
                        getSerials,
                        function () {$('#mdl_serial_view').modal('hide')}
                    ]
                },
                true
            );
        },
        {
            table: 'serial',
            query: [`serial_id=${serial_id}`]
        }
    );
};
function edit_serial_reset() {
    hide('div_serial_edit');
    show('btn_serial_edit');
    show('div_serial_view');
    let return_to_stack = [];
    while (event_listeners.length !== 0) {
        let listener = event_listeners.pop(),
            element  = document.querySelector(`#${listener.id}`);
        if (element) {
            if (element.id === 'form_serial_edit') element.removeEventListener('submit', listener.function)
            else                                   return_to_stack.push(listener);
        };
    };
    event_listeners = return_to_stack;
};
function edit_serial() {
    show('div_serial_edit');
    hide('btn_serial_edit');
    hide('div_serial_view');
};
$('#mdl_serial_view').on('show.bs.modal', function(event) {
    edit_serial_reset();
    getSerialEdit(event.relatedTarget.dataset.serial_id);
});