function listRanks() {
    get(
        function (ranks, options) {
            let selects = document.querySelectorAll('.ranks');
            selects.forEach(e => e.innerHTML = '');
            selects.forEach(e => {e.appendChild(new Option({selected: true}).e)});
            ranks.forEach(rank => {
                selects.forEach(e => {
                    e.appendChild(new Option({
                        value: rank.rank_id,
                        text: rank._rank
                    }).e);
                });;
            });
            ranks_loaded = true;
        },
        {
            db: 'users',
            table: 'ranks',
            query: []
        }
    );
};
window.addEventListener( "load", function () {
    document.querySelector(`#reload`).addEventListener("click", listRanks);
});