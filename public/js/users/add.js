function getExistingUsers(){
    Promise.all([
        clear('tbl_users_existing'),
        getElement('inp_service_number')
    ])
    .then(([tbl_users_existing, inp_service_number]) => {
        get({
            location: 'users/existing',
            where: { service_number:  inp_service_number.value },
            func:  getExistingUsers
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl_users.insertRow(-1);
                addCell(row, {text: user.service_number});
                addCell(row, {text: user.rank.rank});
                addCell(row, {text: user.surname});
                addCell(row, {text: user.first_name});
                addCell(row, {text: user.status.status});
                addCell(row, {text: user.login_id});
                addCell(row, {});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('inp_service_number', getExistingUsers, 'input');
});