function getUsers() {
    clear_table('users')
    .then(tbl => {
        let status = document.querySelector('#sel_statuses') || {value: ''},
            rank   = document.querySelector('#sel_ranks')    || {value: ''};
        get(
            {
                table: 'users',
                query: [status.value, rank.value]
            },
            function (users, options) {
                users.forEach(user => {
                    let row = tbl.insertRow(-1);
                    add_cell(row, {text: user.service_number});
                    add_cell(row, {text: user.rank.rank});
                    add_cell(row, {text: user.surname});
                    add_cell(row, {text: user.first_name});
                    add_cell(row, {append: new Link({
                        href: `/users/${user.user_id}`,
                        small: true
                    }).e});
                });
            }
        );
    })
    .catch(err => console.log(err));
};
function getStatuses() {
    listStatuses({
        select: 'sel_statuses',
        blank: true,
        blank_text: 'All'
    });
};
function getRanks() {
    listRanks({
        select: 'sel_ranks',
        blank: true,
        blank_text: 'All'
    });
};
window.addEventListener("load", function () {
    document.querySelector('#reload')         .addEventListener('click',  getUsers);
    document.querySelector('#sel_statuses')   .addEventListener("change", getUsers);
    document.querySelector('#sel_ranks')      .addEventListener("change", getUsers);
    document.querySelector('#reload_statuses').addEventListener("click",  getStatuses);
    document.querySelector('#reload_ranks')   .addEventListener("click",  getRanks);
});