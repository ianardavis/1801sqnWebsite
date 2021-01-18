var statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Closed'};
function getSession() {
    get(
        function (session, options) {
            for (let [id, value] of Object.entries(session)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === '_status') {
                        element.innerText = statuses[value];
                        let btn_close = document.querySelector('#btn_close');
                        if (value === 1) {
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
            set_breadcrumb({text: session.session_id, href: `/canteen/sessions/${session.session_id}`});
        },
        {
            db:    'canteen',
            table: 'session',
            query: [`session_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSession);