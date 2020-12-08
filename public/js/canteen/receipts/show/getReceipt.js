var statuses = {"0": "Cancelled", "1": "Open", "2": "Complete"};
function getReceipt() {
    get(
        function (receipt, options) {
            for (let [id, value] of Object.entries(receipt)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user') {
                        element.innerText = print_user(value);
                        let receipt_user = document.querySelector('#receipt_user');
                        if (receipt_user) receipt_user.setAttribute('href', `/canteen/users/${value.user_id}`);
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
            let breadcrumb = document.querySelector('#breadcrumb');
            breadcrumb.innerText = receipt.receipt_id;
            breadcrumb.href = `/canteen/receipts/${receipt.receipt_id}`;
        },
        {
            db: 'canteen',
            table: 'receipt',
            query: [`receipt_id=${path[3]}`]
        }
    )
};
document.querySelector('#reload').addEventListener('click', getReceipt);