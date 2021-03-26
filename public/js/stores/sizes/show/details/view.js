function getDetails() {
    get(
        {
            table: 'details',
            query: [`size_id=${path[2]}`]
        },
        function (details, options) {
            let tbl_details = document.querySelector('#tbl_details');
            if (tbl_details) {
                tbl_details.innerHTML = '';
                details.forEach(detail => {
                    let row = tbl_details.insertRow(-1);
                    add_cell(row, {text: detail._name});
                    add_cell(row, {text: detail._value});
                    add_cell(row, {classes: ['details'], data: {field: 'id', value: detail.detail_id}});
                });
                if (typeof detailDeleteBtns === 'function') detailDeleteBtns();
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getDetails);