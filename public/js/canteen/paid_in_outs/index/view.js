let statuses = {'0': 'Cancelled', '1': 'Entered', '2': 'Complete'};
function getPaidInOuts() {
    clear('tbl_paid_in_outs')
    .then(tbl_paid_in_outs => {
        get({
            table: 'paid_in_outs',
            func: getPaidInOuts
        })
        .then(function ([results, options]) {
            results.paid_ins.forEach(paid_in_out => {
                let row = tbl_paid_in_outs.insertRow(-1);
                addCell(row, tableDate(paid_in_out.createdAt));
                addCell(row, {text: (paid_in_out.paid_in ? 'In' : 'Out')});
                addCell(row, {text: paid_in_out.holding.description});
                addCell(row, {text: printUser(paid_in_out.user_paid_in_out)});
                addCell(row, {text: paid_in_out.reason});
                addCell(row, {text: `£${Number(paid_in_out.amount).toFixed(2)}`});
                addCell(row, {text: statuses[paid_in_out.status]});
                addCell(row, {append: new Link(`/paid_in_outs/${paid_in_out.paid_in_out_id}`).e});
            });
        })
    });
};
window.addEventListener('load', function () {
    addListener('reload', getPaidInOuts);
    addSortListeners('paid_in_outs', getPaidInOuts);
    getPaidInOuts();
});