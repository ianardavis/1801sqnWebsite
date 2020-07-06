show_spinner = id => {
    let spn_results = document.querySelector('#spn_' + id);
    spn_results.style.display = 'block';
};
hide_spinner = id => {
    let spn_results = document.querySelector('#spn_' + id);
    spn_results.style.display = 'none';
};