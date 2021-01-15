function getDefault() {
    get(
        function (setting, options) {
            let card = document.querySelector(`#supplier_${setting._value} .card-header`);
            if (card) {
                let subtitle = document.createElement('p');
                subtitle.innerText = 'Default';
                subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
                card.appendChild(subtitle);
            };
        },
        {
            table: 'setting',
            query: ['_name=default_supplier']
        }
    );
};