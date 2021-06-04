function addOrderOption(issue_id) {
    let select = document.querySelector(`#issue_${issue_id}`);
    if (select) select.appendChild(new Option({text: 'Order', value: '3'}).e)
};