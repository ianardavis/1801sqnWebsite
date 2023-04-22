function getEANs() {
    clear('tbl_eans')
    .then(tbl_eans => {
        get({
            table: 'eans',
            where: {item_id: path[2]},
            func: getEANs
        })
        .then(function ([result, options]) {
            result.eans.forEach(ean => {
                try {
                    let row = tbl_eans.insertRow(-1);
                    add_cell(row, {text: ean.ean});
                    add_cell(row, table_date(ean.createdAt));
                    add_cell(row, {append: new Delete_Button({
                        descriptor: 'EAN',
                        path: `/eans/${ean.ean_id}`,
                        small: true
                    }).e});
                    add_cell(row, );
                } catch (error) {
                    console.error(error);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getEANs);
    add_sort_listeners('nsns', getEANs);
    getEANs();
});