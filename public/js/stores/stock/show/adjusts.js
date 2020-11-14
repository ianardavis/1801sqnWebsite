showAdjusts = (lines, options) => {
    try {
        let table_body  = document.querySelector('#adjustTable'),
            adjust_count = document.querySelector('#adjust_count');
        adjust_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(adjust => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(adjust._date).getTime(),
                text: new Date(adjust._date).toDateString()
            });
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