function getCount(table, query, options) {
    get(
        function (results, _options) {
            if (results.length === 0) options.colour = 'success';
            let badge = document.createElement('span'),
            _count = document.querySelector(`#subtitle${table.substring(0, 1).toUpperCase()}${table.substring(1, table.length)}`);
            badge.classList.add('mx-1', `float-${options.float}`, 'badge', `badge-${options.colour}`);
            badge.setAttribute('data-toggle', 'tooltip');
            badge.setAttribute('data-placement', 'top');
            badge.setAttribute('title', `${options.text} ${table}`);
            badge.innerText = results.length;
            _count.appendChild(badge);
        },
        {
            table: table,
            query: query
        }
    );
};