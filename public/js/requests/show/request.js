showRequest = requests => {
    if (requests.length === 1) {
        for (let [id, value] of Object.entries(requests[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === '_for') element.innerText = `${value.rank._rank} ${value.full_name}`
                else if (id === '_by') element.innerText = `${value.rank._rank} ${value.full_name}`
                else if (id === '_date') element.innerText = new Date(value).toDateString()
                else if (id === '_complete' || id === '_closed') {
                    if (value === 0) element.innerText = 'Yes'
                    else element.innerText = 'No';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = requests[0].request_id;
        breadcrumb.href = `/stores/requests/${requests[0].request_id}`;

        // let _edit = document.querySelector('#edit_link');
        // if (_edit) _edit.href = `javascript:edit("requests",${requests[0].request_id})`;
        
        // let add_size = document.querySelector('#add_size');
        // if (add_size) add_size.href = `javascript:add("sizes",{"queries":"request_id=${requests[0].request_id}"})`;
    } else alert(`${requests.length} matching requests found`);
};