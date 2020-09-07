listRanks = (ranks, options) => {
    let select = document.querySelector('#rank_id');
    select.innerHTML = '';
    ranks.forEach(rank => {
        select.appendChild(new Option({
            value: rank.rank_id,
            text: rank._rank
        }).option);
    });
    ranks_loaded = true;
    hide_spinner('ranks');
};
