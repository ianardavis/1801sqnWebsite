function getGiftaids() {
    clear('tbl_giftaid')
    .then(tbl_giftaid => {
        get({
            table: 'giftaids',
            where: {user_id: path[2]}
        })
        .then(function ([results, options]) {
            if (results.giftaid && results.giftaid.count > 0) {
                results.giftaid.forEach(giftaid => {
                    let row = tbl_giftaid.insertRow(-1);
                    add_cell(row, table_date(giftaid.startDate));
                    add_cell(row, table_date(giftaid.endDate));
                    add_cell(row, {append: new Modal_Button(
                        _search(),
                        'giftaid_view',
                        [{field: 'id', value: giftaid.giftaid_id}]
                    ).e});
                });
            };
        });
    });
};
function viewGiftaid(giftaid_id) {
    get({
        table:   'giftaid',
        where:   {giftaid_id: giftaid_id},
        spinner: 'giftaid_view'
    })
    .then(function ([giftaid, options]) {
        setInnerText('giftaid_view_startDate', print_date(giftaid.startDate));
        setInnerText('giftaid_view_endDate',   print_date(giftaid.endDate));
        setInnerText('giftaid_view_createdAt', print_date(giftaid.createdAt, true));
        setInnerText('giftaid_view_updatedAt', print_date(giftaid.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getGiftaids);
    getGiftaids();
    modalOnShow('giftaid_view', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewGiftaid(event.relatedTarget.dataset.id)
        } else modalHide('giftaid_view');
    });
});