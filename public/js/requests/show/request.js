showRequest = (requests, options) => {
    if (requests.length === 1) {
        let _toast = document.querySelector('#incompleteToast');
        if (_toast) _toast.remove();
        for (let [id, value] of Object.entries(requests[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === 'user_for' || id === 'user_by')  {
                    element.innerText = `${value.rank._rank} ${value.full_name}`;
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === 'createdAt' || id === 'updatedAt') {
                    element.innerText = `${new Date(value).toDateString()} ${new Date(value).toLocaleTimeString()}`
                } else if (id === '_status') {
                    if (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) {
                        element.innerText = 'Draft';
                        document.querySelector('#main_container').insertBefore(new Toast({
                            id: 'incompleteToast',
                            title: 'Incomplete Request',
                            text: "This request is still in draft, no items on this request will be actioned or considered until the request is marked as 'Complete'"
                        }).toast, document.querySelector('mainTab'));
                        $('#incompleteToast').toast('show');
                    } else if (value === 2) element.innerText = 'Open'
                    else if (value === 3) element.innerText = 'Closed'
                    else element.innerText = 'Unknown';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = requests[0].request_id;
        breadcrumb.href = `/stores/requests/${requests[0].request_id}`;
        ['action', 'complete', 'cancel', 'addSize', 'delete'].forEach(e => {
            document.querySelector(`#btn_${e}`).setAttribute('disabled', true);
        });
        if (requests[0]._status === 0) {

        } else if (requests[0]._status === 1) {
            if (options.permissions.edit) {
                document.querySelector('#btn_complete').removeAttribute('disabled');
                document.querySelector('#btn_cancel').removeAttribute('disabled');
            };
            if (options.permissions.line_add) {
                document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).modal);
                document.querySelector('#btn_addSize').removeAttribute('disabled');
                add_size_modal('request');
            };
            if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
        } else if (requests[0]._status === 2 || requests[0]._status === 3) {
            if (requests[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
        };
    } else alert(`${requests.length} matching requests found`);
};