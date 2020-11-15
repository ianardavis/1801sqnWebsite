function showSessions(sessions, options) {
    let table_body = document.querySelector('#tbl_sessions'),
        current_sessions = [];
    table_body.innerHTML = '';
    sessions.forEach(session => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            text: print_date(session.createdAt, true),
            sort: new Date(session.createdAt).getTime()
        });
        if (session._end) {
            add_cell(row, {
                text: print_date(session._end, true),
                sort: new Date(session._end).getTime()
            });
        } else add_cell(row);
        add_cell(row, {text: `£${Number(session._takings).toFixed(2)}`});
        if (session._status === 0) {
            add_cell(row, {text: 'Cancelled'});
        } else if (session._status === 1) {
            add_cell(row, {text: 'Open'});
            current_sessions.push(session.session_id)
        } else if (session._status === 2) {
            add_cell(row, {text: 'Closed'});
        } else add_cell(row, {text: 'Unknown'});
        add_cell(row, {append: new Link({
            href: `/canteen/sessions/${session.session_id}`,
            small: true
        }).e});
    });
    let div_modals = document.querySelector('#div_modals');
    div_modals.innerHTML = '';
    if (options.permissions.add) {
        let btn_add_session = document.querySelector('#btn_add_session');
        if (current_sessions.length === 0) {
            div_modals.appendChild(new Modal({
                id: 'add_session',
                static: true,
                title: 'Add Session'
            }).e);
            let mdl_add_session_body  = document.querySelector('#mdl_add_session_body');
            if (mdl_add_session_body) {
                let form = document.createElement('form');
                form.setAttribute('id', 'form_add_session');
                let header = document.createElement('h5');
                header.innerHTML = 'Enter Opening Balance';
                form.appendChild(header);
                [
                    {text: '1p',  name: 'v0001', step: '0.01'},
                    {text: '2p',  name: 'v0002', step: '0.02'},
                    {text: '5p',  name: 'v0005', step: '0.05'},
                    {text: '10p', name: 'v0010', step: '0.1'},
                    {text: '20p', name: 'v0020', step: '0.2'},
                    {text: '50p', name: 'v0050', step: '0.5'},
                    {text: '£1',  name: 'v0100', step: '1'},
                    {text: '£2',  name: 'v0200', step: '2'},
                    {text: '£5',  name: 'v0500', step: '5'},
                    {text: '£10', name: 'v1000', step: '10'},
                    {text: '£20', name: 'v2000', step: '20'},
                    {text: '£50', name: 'v5000', step: '50'}
                ].forEach(e => {
                    let ig = new Input_Group({id: `ig_${e.name}`, title: e.text}).e;
                    ig.appendChild(new Input({
                        placeholder: 'bagged',
                        type: 'number',
                        step: e.step,
                        name: `opening_balance[${e.name}][bagged]`
                    }).e);
                    ig.appendChild(new Input({
                        placeholder: 'loose',
                        type: 'number',
                        step: e.step,
                        name: `opening_balance[${e.name}][loose]`
                    }).e);
                    form.appendChild(ig);
                });
                form.appendChild(new Input({type: 'submit', value: 'Save', classes: ['btn', 'btn-success']}).e);
                mdl_add_session_body.appendChild(form);
                addFormListener(
                    'form_add_session',
                    'POST',
                    `/canteen/sessions`,
                    {onComplete: [window.getSessions, function () {$('#mdl_add_session').modal('hide')}]}
                );
            };
            if (btn_add_session) {
                btn_add_session.classList.remove('hidden');
                btn_add_session.setAttribute('href', 'javascript:$("#mdl_add_session").modal("show")');
            };
        } else {
            if (btn_add_session) {
                btn_add_session.classList.add('hidden');
                btn_add_session.removeAttribute('href');
            };
        };
    };
    hide_spinner('sessions');
};