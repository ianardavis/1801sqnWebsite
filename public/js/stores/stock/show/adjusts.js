showAdjusts = (lines, options) => {
    try {
        clearElement('adjustTable');
        let table_body  = document.querySelector('#adjustTable'),
            adjust_count = document.querySelector('#adjust_count');
        adjust_count.innerText = lines.length || '0';
        lines.forEach(adjust => {
            let row = table_body.insertRow(-1);
            add_cell(row, table_date(adjust.createdAt));
            add_cell(row, {text: adjust._type});
            add_cell(row, {text: adjust._qty});
            add_cell(row, {text: adjust._variance});
            add_cell(row, {text: adjust.user.rank._rank + ' ' + adjust.user.full_name});
        });
        hide_spinner('adjusts');
    } catch (error) {
        console.log(error);
    };
};