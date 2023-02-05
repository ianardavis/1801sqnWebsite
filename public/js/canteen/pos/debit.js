function getCredits() {
    clear('sel_credits')
    .then(sel_credits => {
        get({
            table: 'credits',
            spinner: 'users_debit'
        })
        .then(function ([results, options]) {
            sel_credits.appendChild(new Option({value: '', text: 'Select Account'}).e)
            results.credits.forEach(credit => {
                sel_credits.appendChild(new Option({
                    value: credit.user_id,
                    text: `${credit.user.rank.rank} ${credit.user.full_name} | £${Number(credit.credit).toFixed(2)}`
                }).e)
            });
        });
    })
};
window.addEventListener('load', function () {
    modalOnShow('sale_complete', getCredits);
    addListener('reload_debit',  getCredits);
});