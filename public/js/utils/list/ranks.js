function listRanks(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select || 'sel_ranks')
        .then(sel_ranks => {
            if (options.blank) sel_ranks.appendChild(new Option({selected: (!options.selected), text: options.blank.text || ''}).e);
            get({
                table: 'ranks',
                ...options
            })
            .then(function ([result, options]) {
                result.ranks.forEach(rank => {
                    sel_ranks.appendChild(new Option({
                        value:    rank.rank_id,
                        text:     rank.rank,
                        selected: (options.selected === rank.rank_id)
                    }).e);
                });
                resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};