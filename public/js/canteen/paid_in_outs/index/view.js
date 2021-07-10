let statuses = {'0': 'Cancelled', '1': 'Entered', '2': 'Complete'};
function getPaidInOuts() {
    clear('tbl_paid_in_outs')
    .then(tbl_paid_in_outs => {
        get({table: 'paid_in_outs'})
        .then(function ([paid_in_outs, options]) {
            paid_in_outs.forEach(paid_in_out => {
                let row = tbl_paid_in_outs.insertRow(-1);
                add_cell(row, table_date(paid_in_out.createdAt));
                add_cell(row, {text: (paid_in_out.paid_in ? 'In' : 'Out')});
                add_cell(row, {text: paid_in_out.holding.description});
                add_cell(row, {text: print_user(paid_in_out.user_paid_in_out)});
                add_cell(row, {text: paid_in_out.reason});
                add_cell(row, {text: `£${Number(paid_in_out.amount).toFixed(2)}`});
                add_cell(row, {text: statuses[paid_in_out.status]});
                add_cell(row, {append: new Link({
                    href: `/paid_in_outs/${paid_in_out.paid_in_out_id}`,
                    small: true
                }).e});
            });
        })
    });
};
addReloadListener(getPaidInOuts);