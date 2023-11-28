function getRanks() {
    clear('tbl_ranks')
    .then(tbl_ranks => {
        get({
            table: 'ranks'
        })
        .then(function ([ranks, options]) {
            ranks.forEach(rank => {
                let row = tbl_ranks.insertRow(-1);
                addCell(row, {text: rank._rank});
                addCell(row, {classes: ['ranks'], data: [{field: 'id', value: rank.rank_id}]})
            });
        });
    });
};