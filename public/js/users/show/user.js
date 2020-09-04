showUser = (users, options) => {
    if (users.length === 1) {
        for (let [id, value] of Object.entries(users[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'rank') element.innerText = value._rank
                else if (id === '_reset') element.checked = (value === 1)
                else if (id === 'status') element.innerText = value._status
                else if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb'),
            add_nsn    = document.querySelector('#add_nsn'),
            add_serial = document.querySelector('#add_serial'),
            add_stock  = document.querySelector('#add_stock'),
            add_order  = document.querySelector('#add_order'),
            _edit      = document.querySelector('#edit_link');
        breadcrumb.innerText = `Size: ${users[0].rank._rank} ${users[0].full_name}`;
        breadcrumb.href      = `/stores/users/${users[0].user_id}`;
        if (add_nsn)    add_nsn.href    = `javascript:add("nsns",{"queries":"size_id=${users[0].size_id}"})`;
        if (add_serial) add_serial.href = `javascript:add("serials",{"queries":"size_id=${users[0].size_id}"})`;
        if (add_stock)  add_stock.href  = `javascript:add("stock",{"queries":"size_id=${users[0].size_id}"})`;
        if (add_order)  add_order.href  = '/stores/orders/new?user=-1';
        if (_edit)      _edit.href      = `javascript:edit("users",${users[0].size_id})`;
    } else alert(`${users.length} matching users found`);
};