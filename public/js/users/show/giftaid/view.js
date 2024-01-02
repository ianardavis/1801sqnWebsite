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
                    addCell(row, tableDate(giftaid.startDate));
                    addCell(row, tableDate(giftaid.endDate));
                    addCell(row, {append: new Modal_Button(
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
        table: 'giftaid',
        where: {giftaid_id: giftaid_id}
    })
    .then(function ([giftaid, options]) {
        setInnerText('giftaid_view_startDate', printDate(giftaid.startDate));
        setInnerText('giftaid_view_endDate',   printDate(giftaid.endDate));
        setInnerText('giftaid_view_createdAt', printDate(giftaid.createdAt, true));
        setInnerText('giftaid_view_updatedAt', printDate(giftaid.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getGiftaids);
    getGiftaids();
    modalOnShow('giftaid_view', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewGiftaid(event.relatedTarget.dataset.id)
        } else modalHide('giftaid_view');
    });
});