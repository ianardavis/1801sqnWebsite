function getRanks() {
    clear('tbl_ranks')
    .then(tbl_ranks => {
        get({
            table: 'ranks',
            ...sort_query(tbl_ranks)
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