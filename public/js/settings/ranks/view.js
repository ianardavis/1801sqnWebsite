function getRanks() {
    clear('tbl_ranks')
    .then(tbl_ranks => {
        let sort_cols = tbl_ranks.parentNode.querySelector('.sort') || null;
        get({
            table: 'ranks',
            ...sort_query(sort_cols)
        })
        .then(function ([ranks, options]) {
            ranks.forEach(rank => {
                let row = tbl_ranks.insertRow(-1);
                add_cell(row, {text: rank._rank});
                add_cell(row, {classes: ['ranks'], data: [{field: 'id', value: rank.rank_id}]})
            });
        });
    });
};