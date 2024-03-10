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
                addCell(row, {append: AddUserButton(user.user_id)});
                addFormListener(
                    `add_${user.user_id}`,
                    'POST',
                    '/users/site',
                    {onComplete: [
                        resetFields,
                        getUsers
                    ]}
                );
            });
        });
    });
};
function resetFields() {
    setValue('inp_service_number');
    setValue('sel_ranks_add');
    setValue('inp_surname');
    setValue('inp_first_name');
    setValue('sel_statuses_add');
    setValue('inp_login_id');
};
function AddUserButton(user_id) {
    const form = new Form({
        attributes: [{field: 'id', value: `form_add_${user_id}`}],
        append: [
            new Button({
                noType: true,
                text: 'Add',
                colour: 'success',
                small: true
            }).e,
            new Hidden_Input({
                attributes: [
                    {field: 'name',  value: 'user_id'},
                    {field: 'value', value: user_id}
                ]
            }).e
        ]
    });
    return form.e;
};
window.addEventListener('load', function () {
    addListener('inp_service_number', getExistingUsers, 'input');
    modalOnShow('user_add', getExistingUsers);
    modalOnShow('user_add', resetFields);
});