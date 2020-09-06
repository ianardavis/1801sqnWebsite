showUser = (users, options) => {
    if (users.length === 1) {
        for (let [id, value] of Object.entries(users[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'rank_id') {
                    let _ranks = document.querySelector('#ranks');
                    _ranks.value = value;
                } else if (id === 'status_id') {
                    let _statuses = document.querySelector('#statuses');
                    _statuses.value = value;
                } else if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
    } else alert(`${users.length} matching users found`);
};