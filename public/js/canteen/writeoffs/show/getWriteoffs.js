var statuses = {"0": "Cancelled", "1": "Open", "2": "Complete"};
function getWriteoff() {
    get(
        {
            db: 'canteen',
            table: 'writeoff',
            query: [`writeoff_id=${path[3]}`]
        },
        function (writeoff, options) {
            for (let [id, value] of Object.entries(writeoff)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user') {
                        element.innerText = print_user(value);
                        let writeoff_user = document.querySelector('#writeoff_user');
                        if (writeoff_user) writeoff_user.setAttribute('href', `/canteen/users/${value.user_id}`);
                    } else if (id === '_status') {
                        element.innerText = statuses[value];
                        ['complete', 'cancel', 'add_item'].forEach(e => {
                            let btn = document.querySelector(`#btn_${e}`);
                            if (value === 1) {
                                if (btn) btn.removeAttribute('disabled');
                            } else if (btn) btn.setAttribute('disabled', true);
                        });
                    } else if (id === 'createdAt') element.innerText = print_date(value);
                } catch (error) {console.log(error)};
            };
            set_breadcrumb({text: writeoff.writeoff_id, href: `/canteen/writeoffs/${writeoff.writeoff_id}`});
        }
    );
};
document.querySelector('#reload').addEventListener('click', getWriteoff);