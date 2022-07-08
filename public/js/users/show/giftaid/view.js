function getGiftaids()
{
    clear('tbl_giftaid')
    .then(tbl_giftaid => {
        get({
            table: 'giftaid',
            where: {user_id: path[2]}
        })
        .then(function ([results, options]) {
            results.giftaid.forEach(giftaid => {
                let row = tbl_giftaid.insertRow(-1);
                add_cell(row, table_date(giftaid.startDate));
                add_cell(row, table_date(giftaid.endDate));
                add_cell(row, {append: new Button({
                    modal: 'giftaid_edit',
                    data: [{field: 'id', value: giftaid.giftaid_id}],
                    small: true
                }).e});
            })
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
        set_innerValue('giftaid_edit_start', giftaid.startDate);
        set_innerValue('giftaid_edit_end',   giftaid.endDate);
    });
};
addReloadListener(getGiftaids);
window.addEventListener('load', function () {
    getGiftaids();
    addFormListener(
        'user_password',
        'PUT',
        `/password/${path[2]}`,
        {
            onComplete: [
                getUser,
                function () {modalHide('user_password')}
            ]
        }
    );
    modalOnShow('giftaid_edit', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewGiftaid(event.relatedTarget.dataset.id)
        } else modalHide('giftaid_edit');
    });
});