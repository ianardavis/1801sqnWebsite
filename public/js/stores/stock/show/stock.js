showStock = (stocks, options) => {
    if (stocks.length === 1) {
        for (let [id, value] of Object.entries(stocks[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'location') element.innerText = value._location;
                else if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("stock",${stocks[0].stock_id})`;

        let count = document.querySelector('#_count'),
            scrap = document.querySelector('#_scrap');
        if (count) count.href = `javascript:add("adjusts",{"queries":"stock_id=${stocks[0].stock_id}&adjustType=Count"})`;
        if (scrap) scrap.href = `javascript:add("adjusts",{"queries":"stock_id=${stocks[0].stock_id}&adjustType=Scrap"})`;
    } else alert(`${stocks.length} matching stock found`);
};