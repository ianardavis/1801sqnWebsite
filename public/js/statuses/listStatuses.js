function listStatuses() {
    get(
        function (statuses, options) {
            let selects = document.querySelectorAll('.statuses');
            selects.forEach(e => e.innerHTML = '');
            selects.forEach(e => {e.appendChild(new Option({selected: true}).e)});
            statuses.forEach(status => {
                selects.forEach(e => {
                    e.appendChild(new Option({
                        value: status.status_id,
                        text: status._status
                    }).e);
                });
            });
            statuses_loaded = true;
        },
        {
            db: 'users',
            table: 'statuses',
            query: []
        }
    );
};
window.addEventListener( "load", function () {
    document.querySelector(`#reload`).addEventListener("click", listStatuses);
});