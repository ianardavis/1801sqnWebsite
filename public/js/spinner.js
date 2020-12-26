function show_spinner(id) {
    let spn_results = document.querySelector('#spn_' + id);
    if (spn_results) spn_results.classList.remove('hidden');
};
function hide_spinner(id) {
    let spn_results = document.querySelector('#spn_' + id);
    if (spn_results) spn_results.classList.add('hidden');
};
function add_spinner(cell, options = null) {
    cell.appendChild(new Spinner(options).e);
};
function remove_spinner(id) {
    let spinner = document.querySelector(`#spn_${id}`);
    if (spinner) spinner.remove();
};