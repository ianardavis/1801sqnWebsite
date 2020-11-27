showRequests = (lines, options) => {
    try {
        clearElement('requestTable');
        let table_body    = document.querySelector('#requestTable'),
            request_count = document.querySelector('#request_count');
        request_count.innerText = lines.length || '0';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: line.request._for.rank._rank + ' ' + line.request._for.full_name});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/stores/requests/' + line.request_id,
                small: true}).e});
        });
        hide_spinner('request_lines');
    } catch (error) {
        console.log(error);
    };
};