searchTable = inputField => {
    let filter = inputField.value.toUpperCase(),
        tr = document.querySelectorAll(".search");
    tr.forEach(cell => {
        if ((cell.innerText.toUpperCase().indexOf(filter) > -1) || filter === '') cell.parentNode.style.display = "";
        else cell.parentNode.style.display = "none";
    });
}; 