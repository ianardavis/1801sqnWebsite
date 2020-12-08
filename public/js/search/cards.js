searchCards = inputfield => {
    let filter = inputfield.value.toUpperCase(),
        cards = document.querySelectorAll('.search');
    // Loop through all table rows, and hide those who don't match the search query
    cards.forEach(card => {
        if ((card.innerText.toUpperCase().indexOf(filter) > -1) || filter === '') card.parentNode.parentNode.style.display = "";
        else card.parentNode.parentNode.style.display = "none";
    });
};