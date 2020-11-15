function showSession(sessions, options) {
    if (sessions.length === 1) {
        for (let [id, value] of Object.entries(sessions[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === '_status') {
                    if (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) element.innerText = 'Open'
                    else if (value === 2) element.innerText = 'Closed'
                    else element.innerText = 'Unknown';
                } else if (id === 'createdAt' || id === '_end') {
                    if (value) element.innerText = print_date(value, true);
                } else if (id === 'user_open' || id === 'user_close') {
                    if (value) element.innerText = print_user(value);
                } else if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = sessions[0].session_id;
        breadcrumb.href = `/canteen/sessions/${sessions[0].session_id}`;

        let div_modals = document.querySelector('#div_modals');
        div_modals.innerHTML = '';
        if (div_modals) {
            
        };
    } else alert(`${sessions.length} matching sessions found`);
};