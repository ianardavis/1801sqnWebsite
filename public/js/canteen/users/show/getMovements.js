function getMovements () {
    get(
        function (movements, options) {
            clearElement('tbl_movements');
            let tbl_movements  = document.querySelector('#tbl_movements'),
                movement_count = document.querySelector('#movement_count');
            movement_count.innerText = movements.length || '0';
            if (tbl_movements) {
                movements.forEach(e => {
                    let row = tbl_movements.insertRow(-1);
                    add_cell(row, {
                        text: print_date(e.createdAt),
                        sort: new Date(e.createdAt).getTime()
                    });
                    add_cell(row, {text: ''});
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
            query: [`user_id=${path[3]}`]
        }
    );
    document.querySelector('#reload').addEventListener('click', getMovements);
};