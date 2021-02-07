function getCredits() {
    get(
        {
            db:    'canteen',
            table: 'credits',
            query: []
        },
        function (credits, options) {
            clearElement('credits');
            let _credits = document.querySelector('#credits');
            _credits.appendChild(new Option({value: '', text: 'Select Account'}).e)
            credits.forEach(credit => {
                _credits.appendChild(new Option({value: credit.user_id, text: `${credit.user.rank._rank} ${credit.user.full_name} | £${Number(credit._credit).toFixed(2)}`}).e)
            });
        }
    )
};
document.querySelector('#reload_credits').addEventListener('click', getCredits);