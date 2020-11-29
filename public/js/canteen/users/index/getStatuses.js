function getStatuses () {
    get(
        function (statuses, options) {
            clearElement('sel_status')
            let sel_status = document.querySelector('#sel_status');
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
        },
        {
            db: 'users',
            table: 'statuses',
            query: []
        }
    )
};