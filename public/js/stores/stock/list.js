function getStock(size_id, line_id, cell) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get(
        function (stocks, options) {
            let locations = [{value: '', text: '... Select Location'}];
            stocks.forEach(e => locations.push({value: e.stock_id,text: `${e.location._location}, Qty: ${e._qty}`}));
            let _locations = new Select({
                small: true,
                name: `actions[${line_id}][stock_id]`,
                required: true,
                options: locations
            }).e;
            _cell.appendChild(_locations);
            remove_spinner(`stocks_${line_id}`);
        },
        {
            table: 'stocks',
            query: [`size_id=${size_id}`]
        }
    );
};