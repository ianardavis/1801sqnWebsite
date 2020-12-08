function getCredits() {
    get(
        function (credits, options) {
            clearElement('credits');
            let _credits = document.querySelector('#credits');
            _credits.appendChild(new Option({value: '', text: 'Select Account'}).e)
            credits.forEach(credit => {
                _credits.appendChild(new Option({value: credit.user_id, text: `${credit.user.rank._rank} ${credit.user.full_name} | £${Number(credit._credit).toFixed(2)}`}).e)
            });
        },
        {
            db:    'canteen',
            table: 'credits',
            query: []
        }
    )
};
document.querySelector('#reload_credits').addEventListener('click', getCredits);