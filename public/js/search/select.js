function filter_select(search, select) {
    let filter  = document.querySelector(`#${search}`).value.toLowerCase(),
        options = document.querySelectorAll(`#${select} option`);
    options.forEach(option => {
        console.log(option.innerText)
        if (filter === '' || (option.innerText.toLowerCase().includes(filter))) option.classList.remove('hidden');
        else option.classList.add('hidden');
    });
}; 