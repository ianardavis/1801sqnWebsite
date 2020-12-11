function getNSNs() {
    get(
        function (nsns, options) {
            try {
                clearElement('tbl_nsns');
                clearElement('nsn_modals');
                let table_body = document.querySelector('#tbl_nsns'),
                    nsn_modals = document.querySelector('#nsn_modals');
                set_count({id: 'nsn', count: nsns.length});
                nsns.forEach(nsn => {
                    let row      = table_body.insertRow(-1),
                        d_form   = document.createElement('form'),
                        d_input  = document.createElement('input'),
                        d_button = document.createElement('button');
                    d_form.id     = `form_default_${nsn.nsn_id}`;
                    d_input.value = nsn.nsn_id;
                    d_input.name  = 'size[nsn_id]';
                    d_input.type  = 'hidden';
                    d_form.appendChild(d_input);
                    d_button.innerText = 'Make Default';
                    d_button.classList.add('btn', 'btn-sm', 'btn-success', 'confirm');
                    d_form.appendChild(d_button);
                    let _nsn = `${String(nsn.group._code).padStart(2, '0')}${String(nsn.classification._code).padStart(2, '0')}-${String(nsn.country._code).padStart(2, '0')}-${nsn._item_number}`;
                    add_cell(row, {text: _nsn});
                    add_cell(row, {id: `default${nsn.nsn_id}`, append: d_form});
                    addFormListener(
                        `form_default_${nsn.nsn_id}`,
                        'PUT',
                        `/stores/sizes/${nsn.size_id}`,
                        {onComplete: getNSNs}
                    )
                    add_cell(row, {append: new Link({
                        href: `javascript:$('#mdl_nsn_${nsn.nsn_id}').modal('show')`,
                        small: true}).e}
                    );
                    if (nsn_modals) {
                        nsn_modals.appendChild(new Modal({
                            id: `nsn_${nsn.nsn_id}`,
                            title: 'NSN'
                        }).e);
                        let modal_body = document.querySelector(`#mdl_nsn_${nsn.nsn_id}_body`);
                        if (modal_body) {
                            let nav        = document.createElement('nav'),
                                nav_tabs   = document.createElement('div'),
                                nav_bodies = document.createElement('div'),
                                nav_body_1 = new Tab_Pane({id:{tab:`mdl_nsn_${nsn.nsn_id}_tab_1`,body:`mdl_nsn_${nsn.nsn_id}_body_1`},active:true}).e,
                                nav_body_2 = new Tab_Pane({id:{tab:`mdl_nsn_${nsn.nsn_id}_tab_3`,body:`mdl_nsn_${nsn.nsn_id}_body_3`}}).e;
                            nav_tabs.classList.add('nav', 'nav-tabs');
                            nav_tabs.setAttribute('role', 'tablist');
                            nav_tabs.appendChild(new Tab({id:{tab:`mdl_nsn_${nsn.nsn_id}_tab_1`,body: `mdl_nsn_${nsn.nsn_id}_body_1`},text: 'Item',active: true}).e);
                            nav_tabs.appendChild(new Tab({id:{tab:`mdl_nsn_${nsn.nsn_id}_tab_3`,body: `mdl_nsn_${nsn.nsn_id}_body_3`},text: 'Notes'}).e);
                            nav.appendChild(nav_tabs);
                            nav_bodies.classList.add('tab-content');
                            nav_body_2.appendChild(new Modal_Notes({id: `nsn_${nsn.nsn_id}`}).e);
                            nav_body_1.appendChild(new Input_Group({title: 'NSN', text: _nsn}).e);
                            nav_body_1.appendChild(new Input_Group({title: 'Group',          text: nsn.group._group}).e);
                            nav_body_1.appendChild(new Input_Group({title: 'Classification', text: nsn.classification._classification}).e);
                            nav_body_1.appendChild(new Input_Group({title: 'Country',        text: nsn.country._country}).e);
                            nav_body_1.appendChild(new Input_Group({title: 'Item Number',    text: nsn._item_number}).e);
                            nav_bodies.appendChild(nav_body_1)
                            nav_bodies.appendChild(nav_body_2);
                            nav.appendChild(nav_bodies);
                            mdl_body.appendChild(nav);
                        };
                    }
                });
                const XHR = new XMLHttpRequest();
                XHR.addEventListener("load", event => {
                    let response = JSON.parse(event.target.responseText);
                    if (response.result && response.sizes.length === 1) {
                        let d_cell = document.querySelector(`#default${response.sizes[0].nsn_id}`);
                        if (d_cell) d_cell.innerHTML = _check();
                    } else alert('Error: ' + response.error);
                    hide_spinner('nsns');
                });
                XHR_send(XHR, 'nsns', `/stores/get/sizes?${options.query.join('&')}`);
            } catch (error) {
                console.log(error);
            };
        },
        {
            table: 'nsns',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getNSNs);