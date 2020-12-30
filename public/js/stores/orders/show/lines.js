function getLines() {
    lines_loaded = false;
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        function (lines, options) {
            set_count({id: 'line', count: lines.length || '0'});
            let table_body = document.querySelector('#tbl_lines');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {text: line.size.item._description});
                        add_cell(row, {text: line.size._size});
                        add_cell(row, {text: line._qty});
                        if (
                            (line._status === 1 && line.order._status === 1) ||
                            (line._status === 2 && line.order._status === 2)
                        ) {
                            add_cell(row, {
                                text: line_statuses[line._status],
                                classes: ['actions'],
                                data: {
                                    field: 'line_id',
                                    value: line.line_id
                                }
                            })
                        } else add_cell(row, {text: line_statuses[line._status]});
                        add_cell(row, {append: 
                            new Link({
                                small: true,
                                modal: 'line_view',
                                data: {
                                    field: 'order_line_id',
                                    value: line.line_id
                                }
                            }).e
                        });
                        // if (line._status !== 5 && line._status !== 0 && options.permissions.line_delete) {
                        //     let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                        //     mdl_header.appendChild(
                        //         new DeleteButton({
                        //             path: `/stores/order_lines/${line.line_id}`,
                        //             float: true,
                        //             options: {onComplete: getLines}
                        //         }).e
                        //     );
                        // };
                        // if (
                        //     options.permissions.line_edit &&
                        //     ![0,6].includes(line._status)
                        // ) {
                        //     let cell_action = document.querySelector(`#cell_action_${line.line_id}`),
                        //         action_options = [{value: '', text: 'Select Action', selected: true}];
                        //     if (line._status === 1) { //If pending
                        //         //       
                        //     } else if (line._status === 2) { //If open
                        //         if (line.order._status === 2) {
                        //             action_options.push({value: '0', text: 'Cancel'});
                        //             action_options.push({value: '3', text: 'Demand'});
                        //             action_options.push({value: '4', text: 'Receive'});
                        //             if (line.order.user_id_order !== -1) action_options.push({value: '5', text: 'Issue'});
                        //         };
                        //     } else if (line._status === 3) { //If Demanded
                        //         if (line.order._status === 2) {
                        //             action_options.push({value: '0', text: 'Cancel'});
                        //             action_options.push({value: '4', text: 'Receive'});
                        //             if (line.order.user_id_order !== -1) action_options.push({value: '5', text: 'Issue'});
                        //         };
                        //     } else if (line._status === 4) { //If Received
                        //         if (line.order.user_id_order !== -1) {
                        //             if (line.order._status === 2) {
                        //                 action_options.push({value: '0', text: 'Cancel'});
                        //                 action_options.push({value: '5', text: 'Issue'});
                        //             };
                        //         } else action_options.push({value: '6', text: 'Mark as Complete'});
                        //     } else if (line._status === 5) { //If Issued
                        //         if (line.order._status === 2) action_options.push({value: '6', text: 'Mark as Complete'});
                        //     };
                        //     if (line.order._status === 2) {
                        //         let div_actions = document.createElement('div'),
                        //             div_details = document.createElement('div'),
                        //             div_stocks  = document.createElement('div'),
                        //             div_nsns    = document.createElement('div'),
                        //             div_serials = document.createElement('div');
                        //         let _status = new Select({
                        //             name: `actions[line_id${line.line_id}][_status]`,
                        //             id: `sel_${line.line_id}`,
                        //             small: true,
                        //             options: action_options
                        //         }).e;
                        //         _status.addEventListener("change", function () {
                        //             ['details', 'serials', 'nsns', 'stocks'].forEach(e => clearElement(`${e}_${line.line_id}`))
                        //             if (this.value === '4') {
                        //                 if (line.size._serials) {
                        //                     enterSerial(line.line_id);
                        //                 } else {
                        //                     getStock(line.size_id, line.line_id, 'stocks');
                        //                 };
                        //             } else if (this.value === '5') {
                        //                 getStock(line.size_id, line.line_id, 'stocks');
                        //                 if (line.size._serials) getSerials(line.size_id, line.line_id, 'serials');
                        //                 if (line.size._nsns)    getNSNs(line.size_id, line.line_id, 'nsns', line.size.nsn_id);
                        //             };
                        //         });
                        //         div_details.setAttribute('id', `details_${line.line_id}`);
                        //         div_stocks.setAttribute('id', `stocks_${line.line_id}`);
                        //         div_nsns.setAttribute('id', `nsns_${line.line_id}`);
                        //         div_serials.setAttribute('id', `serials_${line.line_id}`);
                        //         div_actions.appendChild(_status);
                        //         div_actions.appendChild(div_details);
                        //         div_actions.appendChild(div_stocks);
                        //         div_actions.appendChild(div_serials);
                        //         div_actions.appendChild(div_nsns);
                        //         cell_action.appendChild(div_actions);
                        //     };
                        // };
                    } catch (error) {
                        console.log(`Error loading line ${line.line_id}:`)
                        console.log(error);
                    };
                });
            };
            lines_loaded = true;
        },
        {
            table: 'order_lines',
            query: [`order_id=${path[3]}`, sel_status.value]
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload')    .addEventListener('click',  getLines);
    document.querySelector('#sel_status').addEventListener('change', getLines);
    $('#mdl_line_view').on('show.bs.modal', function (event) {showLine(       'order', event.relatedTarget.dataset.order_line_id)});
    $('#mdl_line_view').on('show.bs.modal', function (event) {showLineActions('order', event.relatedTarget.dataset.order_line_id)});
});
// enterSerial = line_id => {
//     let _cell = document.querySelector(`#serials_${line_id}`);
//     _cell.appendChild(
//         new Input({
//             name: `actions[line_id${line_id}][_serial]`,
//             small: true,
//             placeholder: 'Serial #',
//             required: true,
//             maxlength: '45'
//         }).e
//     );
//     _cell.appendChild(
//         new Input({
//             name: `actions[line_id${line_id}][_location]`,
//             small: true,
//             placeholder: 'Location',
//             required: true,
//             maxlength: '20'
//         }).e
//     );
// };