function getStatuses () {
    get(
        {table: 'statuses'},
        function (statuses, options) {
            clearElement('sel_status')
            let sel_status = document.querySelector('#sel_status');
            sel_status.appendChild(
                new Option({
                    value: '',
                    text: 'All',
                    selected: true
                }).e
            );
            if (sel_status) {
                statuses.forEach(status => {
                    sel_status.appendChild(
                        new Option({
                            value: `status_id=${status.status_id}`,
                            text: status._status
                        }).e
                    );
                });
            };
            getUsers();
        }
    );
};