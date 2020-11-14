setDefault = results => {
    if (results.length === 1) {
        let card = document.querySelector(`#supplier_${results[0]._value} .card-header`);
        if (card) {
            let subtitle = document.createElement('p');
            subtitle.innerText = 'Default';
            subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
            card.appendChild(subtitle);
        };
    } else {
        alert(`Error: ${results.length} default suppliers found`);
    };
};