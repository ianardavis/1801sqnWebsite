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
                    addCell(row, {text: ean.ean});
                    addCell(row, tableDate(ean.createdAt));
                    addCell(row, {append: new Delete_Button({
                        descriptor: 'EAN',
                        path: `/eans/${ean.ean_id}`,
                        small: true
                    }).e});
                    addCell(row, );
                } catch (error) {
                    console.error(`canteen/items/show/eans/view.js | getEANs | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getEANs);
    addSortListeners('nsns', getEANs);
    getEANs();
});