function addDemandOption(order_id) {
    let select = document.querySelector(`#order_${order_id}`);
    if (select) select.appendChild(new Option({value: '2', text: 'Demand'}).e);
};