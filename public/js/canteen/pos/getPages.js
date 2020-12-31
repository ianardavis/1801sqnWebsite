function getPages() {
    get(
        function (pages, options) {
            clearElement('tab_headers');
            clearElement('tab_pages');
            pages.forEach(page => {
                tab_headers.appendChild(new Tab_Header({id: `page_${page.page_id}`, text: page._title}).e);
                let pane = new Tab_Body({id: `page_${page.page_id}`}).e,
                    pane_items = new Div({classes: ['row', 'h-150-px']}).e;
                page.items.forEach(item => {
                    pane_items.appendChild(
                        new Form({
                            classes: ['col-6', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2', 'h-100'],
                            append: [
                                new Hidden({
                                    attributes:[
                                        {field: 'name', value: 'line[sale_id]'}
                                    ],
                                    classes: ['sale_id']
                                }).e,
                                new Hidden({
                                    attributes:[
                                        {field: 'name', value: 'line[item_id]'},
                                        {field: 'value', value: String(item.item_id)}
                                    ]
                                }).e,
                                new Button({
                                    text: `${item.item._name}\n£${Number(item.item._price).toFixed(2)}`,
                                    classes: ['w-100', 'h-100', 'btn', 'btn-primary']
                                }).e
                            ],
                            submit: function(event) {
                                event.preventDefault();
                                sendData(this, 'POST', "/canteen/sale_lines", {onComplete: getSaleLines, noConfirm: true});
                            }
                        }).e
                    );
                });
                pane.appendChild(pane_items);
                tab_pages.appendChild(pane);
            });
            get(
                function (settings, options) {
                    showTab(`page_${settings._value}`)
                },
                {
                    db: 'canteen',
                    table: 'settings',
                    query: ['_name=default_pos_page']
                }
            )
            items_loaded = true;
            load_check();
        },
        {
            db: 'canteen',
            table: 'pos_pages',
            query: []
        }
    );
};