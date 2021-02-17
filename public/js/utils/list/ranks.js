let ranks_loaded = false;
function listRanks(options = {}) {
    ranks_loaded = false;
    get(
        {
            db:    'users',
            table: 'ranks',
            ...options
        },
        function (ranks, options) {
            let select = document.querySelector(`#${options.id || 'rank_id'}`);
            if (select) {
                select.innerHTML = '';
                if (options.blank === true) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
                ranks.forEach(rank => {
                    let value = null;
                    if (options.id_only) value = rank.rank_id
                    else                 value = `rank_id=${rank.rank_id}`;
                    select.appendChild(new Option({
                        value:    value,
                        text:     rank._rank,
                        selected: (options.selected === rank.rank_id)
                    }).e);
                });
                ranks_loaded = true;
            };
        }
    );
};