getStock = (size_id, line_id, cell) => {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `stocks_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            if (response.stock) {
                let locations = [{value: '', text: '... Select Location'}];
                response.stock.forEach(e => locations.push({value: e.stock_id,text: `${e.location._location}, Qty: ${e._qty}`}));
                let _locations = new Select({
                    small: true,
                    name: `actions[line_id${line_id}][stock_id]`,
                    required: true,
                    options: locations
                }).e;
                _cell.appendChild(_locations);
            } else {
                alert(`Error: no matching stock found`);
            };
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`stocks_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`stocks_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/stock?size_id=${size_id}`);
    XHR.send();
};