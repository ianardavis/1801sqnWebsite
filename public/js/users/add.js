function getExistingUsers(){
    Promise.all([
        clear('tbl_users_existing'),
        getElement('inp_service_number')
    ])
    .then(([tbl_users_existing, inp_service_number]) => {
        get({
            location: 'users/existing',
            table: 'users_existing',
            like: { service_number:  inp_service_number.value },
            func:  getExistingUsers
        })
        .then(function ([result, options]) {
            result.users.forEach(user => {
                let row = tbl_users_existing.insertRow(-1);
                addCell(row, {text: user.rank.rank});
                addCell(row, {text: user.surname});
                addCell(row, {text: user.first_name});
                addCell(row, {text: user.status.status});
                addCell(row, {append: new Form({
                    attributes: [
                        {field: 'id', value: `form_add_${user.user_id}`}
                    ],
                    append: [new Button({
                        noType: true,
                        text: 'Add',
                        colour: 'success',
                        small: true
                    }).e]
                }).e});
                addFormListener(
                    `add_${user.user_id}`,
                    'POST',
                    `/users/site/${user.user_id}/${site_id}`,
                    {}
                )
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('inp_service_number', getExistingUsers, 'input');
    modalOnShow('user_add', getExistingUsers);
});