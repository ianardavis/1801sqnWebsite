function getLocations() {
    clear('tbl_stocks');
    clear('sel_location')
    .then(sel_location => {
        sel_location.appendChild(new Option({text: '...Select a location', selected: true}).e);
        get({table: 'locations'})
        .then(function ([result, options]) {
            result.locations.forEach(location => {
                sel_location.appendChild(new Option({text: location.location, value: location.location_id}).e);
            });
        });
    });
};
function getStocks(location_id) {
    clear('tbl_stocks')
    .then(tbl_stocks => {
        function add_line(stock, index) {
            let row = tbl_stocks.insertRow(-1);
            addCell(row, {text: stock.size.item.description});
            addCell(row, {text: stock.size.size1});
            addCell(row, {text: stock.size.size2});
            addCell(row, {text: stock.size.size3});
            addCell(row, {text: stock.qty || '0'});
            addCell(row, {append: [
                new Number_Input({
                    attributes: [
                        {field: 'name', value: `counts[][${index}][qty]`},
                        {field: 'min',  value: '0'}
                    ]
                }).e,
                new Hidden_Input({
                    attributes: [
                        {field: 'name',  value: `counts[][${index}][stock_id]`},
                        {field: 'value', value: stock.stock_id}
                    ]
                }).e
            ]});
            addCell(row, {append: new Link(`/stocks/${stock.stock_id}`).e});
        };
        setValue('location_id', location_id)
        if (location_id) {
            get({
                table: 'stocks',
                where: {location_id: location_id}
            })
            .then(function ([result, options]) {
                let index = 0;
                result.stocks.forEach(stock => {
                    add_line(stock, index);
                    index++;
                });
            });
        };
    });
};
window.addEventListener('load', function () {
    addListener('reload', getLocations);
    addListener('sel_location', function (e) {getStocks(e.target.value)}, 'input');
    addFormListener(
        'stocks',
        'PUT',
        '/stocks/counts',
        {onComplete: function (e) {getStocks(e.result)}}
    );
    addSortListeners('locations', getStocks);
    getLocations();
});