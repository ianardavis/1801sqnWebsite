function getRanks() {
    let tbl_ranks = document.querySelector('#tbl_ranks');
    if (tbl_ranks) {
        tbl_ranks.innerHTML = '';
        get(
            {table: 'ranks'},
            function (ranks, options) {
                ranks.forEach(rank => {
                    let row = tbl_ranks.insertRow(-1);
                    add_cell(row, {text: rank._rank});
                    add_cell(row, {classes: ['ranks'], data: {field: 'id', value: rank.rank_id}})
                });
            }
        );
    };
};