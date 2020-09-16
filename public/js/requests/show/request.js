showRequest = requests => {
    if (requests.length === 1) {
        for (let [id, value] of Object.entries(requests[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === '_for') {
                    let _element = document.querySelector(`#_${id}`);
                    _element.innerText = value[`_${id}`];
                } else if (element) {
                    element.innerText = value;
                    if (id === '_size_text') {
                        let size_text = document.querySelector('#size_text');
                        size_text.innerText = value;
                    };
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = requests[0]._description;
        breadcrumb.href = `/stores/requests/${requests[0].request_id}`;

        // let _edit = document.querySelector('#edit_link');
        // if (_edit) _edit.href = `javascript:edit("requests",${requests[0].request_id})`;
        
        // let add_size = document.querySelector('#add_size');
        // if (add_size) add_size.href = `javascript:add("sizes",{"queries":"request_id=${requests[0].request_id}"})`;
    } else alert(`${requests.length} matching requests found`);
};