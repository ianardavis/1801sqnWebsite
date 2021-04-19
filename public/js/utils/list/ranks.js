function listRanks(options = {}) {
    return new Promise((resolve, reject) => {
        clear_select(options.select)
        .then(sel_ranks => {
            if (options.blank) sel_ranks.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get({
                table: 'ranks',
                ...options
            })
            .then(function ([ranks, options]) {
                ranks.forEach(rank => {
                    sel_ranks.appendChild(new Option({
                        value:    (options.id_only ? rank.rank_id : `rank_id=${rank.rank_id}`),
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