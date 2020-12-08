searchSelect = (search, select) => {
    let filter  = document.querySelector(`#${search}`).value.toLowerCase(),
        options = document.querySelectorAll(`#${select} option`);
    options.forEach(option => {
        if ((option.innerText.toLowerCase().indexOf(filter) > -1) || filter === '') option.style.display = "";
        else option.style.display = "none";
    });
}; 