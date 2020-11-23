function showCredits(credits, options) {
    let _credits = document.querySelector('#credits');
    _credits.innerHTML = '';
    _credits.appendChild(new Option({value: '', text: 'Select Account'}).e)
    credits.forEach(credit => {
        _credits.appendChild(new Option({value: credit.user_id, text: `${credit.user.rank._rank} ${credit.user.full_name} | £${Number(credit._credit).toFixed(2)}`}).e)
    });
};