function getCredits() {
    get(
        {
            db:    'canteen',
            table: 'credits',
            spinner: 'users_debit'
        },
        function (credits, options) {
            let _credits = document.querySelector('#sel_credits');
            if (_credits) {
                _credits.innerHTML = '';
                _credits.appendChild(new Option({value: '', text: 'Select Account'}).e)
                credits.forEach(credit => {
                    _credits.appendChild(new Option({value: credit.user_id, text: `${credit.user.rank._rank} ${credit.user.full_name} | £${Number(credit._credit).toFixed(2)}`}).e)
                });
            };
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_sale_complete').on('show.bs.modal', getCredits);
    document.querySelector('#reload_debit').addEventListener('click', getCredits);
});