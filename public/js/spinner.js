show_spinner = id => {
    try {
        let spn_results = document.querySelector('#spn_' + id);
        spn_results.style.display = 'block';
    } catch (error) {
        console.log(`No spinner with ID spn_${id}`);
    };
};
hide_spinner = id => {
    try {
        let spn_results = document.querySelector('#spn_' + id);
        spn_results.style.display = 'none';
    } catch (error) {
        console.log(`No spinner with ID spn_${id}`);
    };
};