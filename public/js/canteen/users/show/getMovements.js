function getMovements (query_column) {
    get(
        function (movements, options) {
            let table = '';
            if      (query_column === 'user_id_to')   table = 'paid_out'
            else if (query_column === 'user_id_from') table = 'paid_in'
            clearElement(`tbl_${table}`);
            let tbl_movements  = document.querySelector(`#tbl_${table}`),
                movement_count = document.querySelector(`#${table}_count`);
            movement_count.innerText = movements.length || '0';
            if (tbl_movements) {
                movements.forEach(e => {
                    let row = tbl_movements.insertRow(-1);
                    add_cell(row, table_date(e.createdAt));
                    add_cell(row, {text: `£${Number(e._amount).toFixed(2)}`});
                    add_cell(row, {text: e._type});
                    add_cell(row, {append: new Link({
                        small: true,
                        href: `/canteen/movements/${e.movement_id}`
                    }).e})
                });
            };
        },
        {
            db: 'canteen',
            table: 'movements',
            query: [`${query_column}=${path[3]}`]
        }
    );
    document.querySelector('#reload').addEventListener('click', getMovements);
};