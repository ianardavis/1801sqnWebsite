function getDemand(perms = {}) {
    let statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Open', '3': 'Closed'};
    get(
        function (demand, options) {
            for (let [id, value] of Object.entries(demand)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user')  {
                        element.innerText = `${value.rank._rank} ${value.full_name}`;
                        let link = document.querySelector(`#${id}_link`);
                        link.setAttribute('href', `/stores/users/${value.user_id}`);
                    } else if (id === 'supplier') {
                        element.innerText = value._name;
                        let link = document.querySelector(`#${id}_link`);
                        link.setAttribute('href', `/stores/suppliers/${value.supplier_id}`);
                    } else if (id === 'createdAt' || id === 'updatedAt') {
                        element.innerText = `${new Date(value).toDateString()} ${new Date(value).toLocaleTimeString()}`
                    } else if (id === '_status') {
                        element.innerText = statuses[value] || 'Unknown';
                    };
                } catch (error) {console.log(error)};
            };
            let breadcrumb = document.querySelector('#breadcrumb');
            breadcrumb.innerText = demand.demand_id;
            breadcrumb.href = `/stores/demands/${demand.demand_id}`;
    
            ['action', 'complete', 'addSize', 'delete'].forEach(e => document.querySelector(`#btn_${e}`).setAttribute('disabled', true));
            if (demand._status === 0) {
            } else if (demand._status === 1) {
                if (options.permissions.edit) {
                    document.querySelector('#btn_complete').removeAttribute('disabled');
                };
                if (options.permissions.line_add) {
                    document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).e);
                    document.querySelector('#btn_addSize').removeAttribute('disabled');
                    add_size_modal('demand');
                };
                if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
            } else if (demand._status === 2 || demand._status === 3) {
                document.querySelector('#btn_download').removeAttribute('disabled');
                if (demand._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
            };
        },
        {
            table: 'demand',
            query: [`demand_id=${path[3]}`],
            permissions: perms
        }
    );
};