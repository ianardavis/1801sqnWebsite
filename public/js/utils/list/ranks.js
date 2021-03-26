function listRanks(options = {}) {
    return new Promise((resolve, reject) => {
        let select = document.querySelector(`#${options.select}`);
        if (select) {
            select.innerHTML = '';
            if (options.blank) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get(
                {
                    table: 'ranks',
                    ...options
                },
                function (ranks, options) {
                    ranks.forEach(rank => {
                        select.appendChild(new Option({
                            value:    (options.id_only ? rank.rank_id : `rank_id=${rank.rank_id}`),
                            text:     rank.rank,
                            selected: (options.selected === rank.rank_id)
                        }).e);
                    });
                    resolve(true);
                }
            )
            .catch(err => reject(err));
        } else reject(new Error('Rank select not found'));
    });
};