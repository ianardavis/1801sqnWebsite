var statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Closed'};
function showSession(session, options) {
    for (let [id, value] of Object.entries(session)) {
        try {
            let element = document.querySelector(`#${id}`);
            if (id === '_status') {
                element.innerText = statuses[value];
                let btn_close = document.querySelector('#btn_close');
                if (value === 1 && options.permissions.edit) {
                    btn_close.addEventListener('click', function () {$("#mdl_close_session").modal("show")});
                    btn_close.removeAttribute('disabled');
                } else {
                    btn_close.removeEventListener('click', function () {$("#mdl_close_session").modal("show")});
                    btn_close.setAttribute('disabled', true);
                };
            } else if (id === 'createdAt' || id === '_end') {
                if (value) element.innerText = print_date(value, true);
            } else if (id === 'user_open' || id === 'user_close') {
                if (value) element.innerText = print_user(value);
            } else if (id === 'takings' || id ==='paid_in' || id === 'paid_out') {
                element.innerText = `£${value.toFixed(2)}`;
            } else if (element) element.innerText = value;
        } catch (error) {console.log(error)};
    };
    let breadcrumb = document.querySelector('#breadcrumb');
    breadcrumb.innerText = session.session_id;
    breadcrumb.href = `/canteen/sessions/${session.session_id}`;

    let div_modals = document.querySelector('#div_modals');
    if (div_modals) {
        div_modals.innerHTML = '';
        if (options.permissions.edit) {
            div_modals.appendChild(new Modal({
                id: 'close_session',
                statuc: true, 
                title: 'Close Session'
            }).e);
            let mdl_close_session_body  = document.querySelector('#mdl_close_session_body');
            if (mdl_close_session_body) {
                let form = document.createElement('form');
                form.setAttribute('id', 'form_close');
                let header = document.createElement('h5');
                header.innerHTML = 'Enter balance being returned';
                form.appendChild(header);
                [
                    {text: '1p',      name: 'c0001',   step: '0.01'},
                    {text: '2p',      name: 'c0002',   step: '0.02'},
                    {text: '5p',      name: 'c0005',   step: '0.05'},
                    {text: '10p',     name: 'c0010',   step: '0.1'},
                    {text: '20p',     name: 'c0020',   step: '0.2'},
                    {text: '50p',     name: 'c0050',   step: '0.5'},
                    {text: '£1',      name: 'c0100',   step: '1'},
                    {text: '£2',      name: 'c0200',   step: '2'},
                    {text: '£5',      name: 'c0500',   step: '5'},
                    {text: '£10',     name: 'c1000',   step: '10'},
                    {text: '£20',     name: 'c2000',   step: '20'},
                    {text: '£50',     name: 'c5000',   step: '50'}
                ].forEach(e => {
                    let ig = new Input_Group({id: `ig_${e.name}`, title: e.text}).e;
                    ig.appendChild(new Input({
                        placeholder: 'bagged',
                        type: 'number',
                        step: e.step,
                        min: '0',
                        name: `balance[${e.name}][b]`
                    }).e);
                    ig.appendChild(new Input({
                        placeholder: 'loose',
                        type: 'number',
                        step: e.step,
                        min: '0',
                        name: `balance[${e.name}][l]`
                    }).e);
                    form.appendChild(ig);
                });
                let cheques = new Input_Group({id: `ig_cheques`, title: 'Cheques'}).e;
                cheques.appendChild(new Input({
                    type: 'number',
                    step: '0.01',
                    min: '0',
                    name: `balance[cheques][cheques]`
                }).e);
                form.appendChild(cheques);
                form.appendChild(new Input({type: 'submit', value: 'Save', classes: ['btn', 'btn-success']}).e);
                mdl_close_session_body.appendChild(form);
                let onComplete = [function(){$("#mdl_close_session").modal("hide")},getSession];
                if (options.permissions.access_sales) onComplete.push(getSales);
                addFormListener(
                    'form_close',
                    'PUT',
                    `/canteen/sessions/${session.session_id}`,
                    {onComplete: onComplete}
                )
            };
            let btn_close_session = document.querySelector('#btn_close_session');
            if (btn_close_session) {
                btn_close_session.setAttribute('href', 'javascript:$("#mdl_close_session").modal("show")');
            };
        };
    };
};