function getRequests() {
    get(
        function (lines, options) {
            let table_body = document.querySelector('#tbl_requests');
            set_count({id: 'request', count: lines.length});
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {text: print_user(line.request.user_id_request)});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {append: new Link({
                            href: `/stores/requests/${line.request_id}`,
                            small: true}).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'request_lines',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getRequests);