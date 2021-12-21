function listHoldings(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select || 'sel_holdings')
        .then(sel_holdings => {
            get({
                table: 'holdings',
                ...options
            })
            .then(function ([result, options]) {
                sel_holdings.appendChild(new Option({
                    text: options.blank_text || '',
                    selected: (options.selected === '')
                }).e);
                result.holdings.forEach(holding => {
                    sel_holdings.appendChild(
                        new Option({
                            text:     holding.description,
                            value:    holding.holding_id,
                            selected: (options.selected === holding.holding_id)
                        }).e
                    );
                });
				resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};