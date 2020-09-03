listRanks = (ranks, options) => {
    let select = document.querySelector('#ranks');
    select.innerHTML = '';
    ranks.forEach(rank => {
        select.appendChild(new Option({
            value: rank.rank_id,
            text: rank._rank
        }).option);
    });
    hide_spinner('ranks');
};