showReturns = (lines, options) => {
    try {
        let table_body   = document.querySelector('#returnTable'),
            return_count = document.querySelector('#return_count');
        return_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(line.return._date).getTime(),
                text: new Date(line.return._date).toDateString()
            });
            add_cell(row, {text: line.return._from.rank._rank + ' ' + line.return._from.full_name});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/stores/returns/' + line.return_id,
                small: true
            }).e});
        });
        hide_spinner('return_lines');
    } catch (error) {
        console.log(error);
    };
};