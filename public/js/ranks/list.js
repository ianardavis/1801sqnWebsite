listRanks = (ranks, options) => {
    clearElement('rank_id');
    let select = document.querySelector('#rank_id');
    ranks.forEach(rank => {
        select.appendChild(new Option({
            value: rank.rank_id,
            text: rank._rank
        }).e);
    });
    ranks_loaded = true;
    hide_spinner('rank_id');
};
