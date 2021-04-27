function getAccount () {
    get({
        table: 'account',
        query:[`account_id=${path[2]}`]
    })
    .then(function ([account, options]) {
        for (let [id, value] of Object.entries(accounts[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
        get({
            table: 'users',
            query:['status_id=2'],
            selected: accounts[0].user_id
        })
        .then(showUsers);
    });
};