// function getReceipts(size_id) {
//     let spn_receipts = document.querySelector('#spn_receipts');
//     spn_receipts.style.display = 'block';
//     const XHR = new XMLHttpRequest();
//     XHR.addEventListener("load", event => {
//         let response      = JSON.parse(event.target.responseText),
//             table_body    = document.querySelector('#receiptTable'),
//             receipt_count = document.querySelector('#receipt_count');
//         if (response.lines) receipt_count.innerText = response.lines.length || '0';
//         table_body.innerHTML = '';
//         if (response.result) {
//             response.lines.forEach(line => {
//                 let row = table_body.insertRow(-1);
//                 let cell1 = row.insertCell(-1),
//                     cell2 = row.insertCell(-1),
//                     cell3 = row.insertCell(-1),
//                     cell4 = row.insertCell(-1);
//                 cell1.dataset.sort = new Date(line.receipt._date).getTime();
//                 cell1.innerText    = new Date(line.receipt._date).toDateString();
//                 cell2.innerText = line._qty;
//                 cell3.innerText = line.receipt.user.rank._rank + ' ' + line.receipt.user.full_name;
//                 cell4.appendChild(link('/stores/receipts/' + line.receipt_id, false));
//             });
//         } else alert('Error: ' + response.error)
//         spn_receipts.style.display = 'none';
//     });
//     XHR.addEventListener("error", event => alert('Oops! Something went wrong getting receipts'));
//     XHR.open('GET', '/stores/get/receipt_lines?size_id=' + size_id);
//     XHR.send();
// };

showReceipts = (lines, options) => {
    try {
        let table_body    = document.querySelector('#receiptTable'),
            receipt_count = document.querySelector('#receipt_count');
        receipt_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(line.receipt._date).getTime(),
                text: new Date(line.receipt._date).toDateString()
            });
            add_cell(row, {text: line.stock.location._location});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/stores/receipts/' + line.receipt_id,
                small: true
            }).link});
        });
        hide_spinner('receipt_lines');
    } catch (error) {
        console.log(error);
    };
};