function getStock(size_id, line_id, cell, entry = false) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    get({
        table: 'stocks',
        query: [`size_id=${size_id}`]
    })
    .then(function ([stocks, options]) {
        let locations = [{value: '', text: '... Select Location'}];
        stocks.forEach(e => locations.push({value: e.stock_id, text: `${e.location._location}, Qty: ${e._qty}`}));
        _cell.appendChild(
            new Select({
                attributes: [
                    {field: 'name',     value: `actions[${line_id}][stock_id]`},
                    {field: 'required', value: (entry === false)}
                ],
                small: true,
                options: locations
            }).e
        );
        if (entry === true) {
            _cell.appendChild(
                new Input({
                    attributes: [
                        {field: 'name',        value: `actions[${line_id}][location]`},
                        {field: 'placeholder', value: 'Enter Location'}
                    ],
                    small: true
                }).e
            );
        };
        remove_spinner(`stocks_${line_id}`);
    });
};