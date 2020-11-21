function showCredits(credits, options) {
    let debit = document.querySelector('#debit');
    debit.innerHTML = ''
    debit.appendChild(new Option({value: '', text: 'Select Account'}).e)
    credits.forEach(credit => {
        debit.appendChild(new Option({value: credit.user_id, text: `${credit.user.rank._rank} ${credit.user.full_name} - £${Number(credit._credit).toFixed(2)}`}).e)
    });
};