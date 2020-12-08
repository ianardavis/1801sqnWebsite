function getMovements() {
    let sel_confirmed = document.querySelector('#sel_confirmed');
    get(
        function (movements, options) {
            clearElement('tbl_movements');
            let table_body = document.querySelector('#tbl_movements');
            movements.forEach(movement => {
                let row = table_body.insertRow(-1);
                if      (movement.user_from)    add_cell(row, {text: print_user(movement.user_from)})
                else if (movement.holding_from) add_cell(row, {text: movement.holding_from._description})
                else                            add_cell(row);
                if      (movement.user_to)    add_cell(row, {text: print_user(movement.user_to)})
                else if (movement.holding_to) add_cell(row, {text: movement.holding_to._description})
                else                          add_cell(row);
                add_cell(row, {text: movement._type});
                add_cell(row, {text: movement._description});
                add_cell(row, {text: `£${Number(movement._amount).toFixed(2)}`});
                add_cell(row, {append: new Link({
                    href: `/canteen/movements/${movement.movement_id}`,
                    small: true
                }).e});
            });
        },
        {
            db: 'canteen',
            table: 'movements',
            query: [sel_confirmed.value]
        }
    );
};
let reload        = document.querySelector('#reload'),
    sel_confirmed = document.querySelector('#sel_confirmed');
if (reload) reload.addEventListener('click', getMovements);
if (sel_confirmed) sel_confirmed.addEventListener('change', getMovements);
