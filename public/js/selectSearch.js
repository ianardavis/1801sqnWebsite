function searchTable(table, inputfield) {
    // Declare variables
    var input, filter, table, opt, i;
    input = document.getElementById(inputfield);
    filter = input.value.toUpperCase();
    table = document.getElementById(table);
    opt = table.getElementsByTagName("option");
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < opt.length; i++) {
        if (opt[i]) {
            if ((opt[i].innerText.toUpperCase().indexOf(filter) > -1) || filter === '') {
                opt[i].style.display = "";
            } else {
                opt[i].style.display = "none";
            }
        }
    }
}    