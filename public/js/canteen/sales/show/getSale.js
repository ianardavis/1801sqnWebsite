function getSale() {
    get(
        {
            db: 'canteen',
            table: 'sale',
            query: [`sale_id=${path[3]}`]
        },
        function (sale, options) {
            for (let [id, value] of Object.entries(sale)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user') {
                        if (element) element.innerText = print_user(value);
                    } else if (id === '_status') {
                        if      (value === 0) element.innerText = 'Cancelled'
                        else if (value === 1) element.innerText = 'Open'
                        else if (value === 2) element.innerText = 'Complete';
                    } else if (id === 'createdAt') {
                        if (element) element.innerText = print_date(value, true);
                    };
                } catch (error) {console.log(error)};
            };
            set_breadcrumb({text: sale.sale_id, href: `/canteen/sales/${sale.sale_id}`});
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSale);