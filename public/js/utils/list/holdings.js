function listHoldings(options = {}) {
    return new Promise((resolve, reject) => {
        clear_select(options.select || 'holdings')
        .then(sel_holdings => {
            get({
                table: 'holdings',
                ...options
            })
            .then(function ([holdings, options]) {
                sel_holdings.appendChild(new Option({text: options.blank_text || '', selected: (options.selected === '')}).e);
                holdings.forEach(holding => {
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