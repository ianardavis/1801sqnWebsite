function getItems() {
    get(
        function (items, options) {
            let sel_items = document.querySelector('#sel_items');
            if (sel_items) {
                sel_items.innerHTML = '';
                items.forEach(item => {
                    if (sel_items) {
                        sel_items.appendChild(
                            new Option({
                                text: item._description,
                                value: item.item_id
                            }).e
                        )
                    } else console.log('sel_items not found');
                });
            } else console.log('sel_items not found');
        },
        {
            table: 'items',
            query: []
        }
    );
};
function search_sizes(item_id) {
    get(
        function (sizes, options) {
            let sel_sizes = document.querySelector('#sel_sizes'),
                div_sizes = document.querySelector('#div_sizes'),
                sel_items = document.querySelector('#sel_items');
            if (sel_sizes) {
                sel_sizes.innerHTML = '';
                if (div_sizes) div_sizes.classList.remove('hidden');
                if (sel_items) sel_items.removeAttribute('size');
                sizes.forEach(size => {
                    if (sel_sizes) {
                        sel_sizes.appendChild(
                            new Option({
                                text: size._size,
                                value: size.size_id
                            }).e
                        )
                    } else console.log('sel_sizes not found');
                });
            } else console.log('sel_sizes note found');
        },
        {
            table: 'sizes',
            query: [`item_id=${item_id}`]
        }
    );
};
function show_details() {
    let sel_sizes = document.querySelector('#sel_sizes'),
        div_size  = document.querySelector('#div_size');
    if (sel_sizes) {
        if (div_size) div_size.classList.remove('hidden');
        if (sel_sizes) sel_sizes.removeAttribute('size');
    } else console.log('sel_sizes not found');
};
function showSize(sizes, options) {
    clearElement('sel_locations');
    clearElement('div_serials');
    let sel_locations     = document.querySelector('#sel_locations'),
        grp_inp_location  = document.querySelector('#grp_inp_location'),
        grp_sel_locations = document.querySelector('#grp_sel_locations'),
        sel_sizes         = document.querySelector('#sel_sizes');;
    let serial_func = function() {getSerials(options.options)}
    document.querySelector('#add_size_qty').removeEventListener('change', serial_func);
    if (sizes.length === 1) {
        if (sizes[0]._serials) {
            sel_locations.removeAttribute('required');
            if (options.options.locations) {
                grp_inp_location.classList.add('hidden');
                grp_sel_locations.classList.add('hidden');
            };
            serial_func();
            document.querySelector('#add_size_qty').addEventListener('change', serial_func);
        } else if (options.options.locations) {
            sel_locations.setAttribute('required', true);
            grp_inp_location.classList.remove('hidden');
            grp_sel_locations.classList.remove('hidden');
            sel_locations.appendChild(new Option({value: '', text: 'Enter Manually', selected: true}).e);
            get(
                showLocations,
                {
                    table: 'stock',
                    query: [`size_id=${sel_sizes.value}`],
                    options: options.options
                }
            );
        };
    };
};
function reset_add_size() {
    let div_sizes    = document.querySelector('#div_sizes'),
        div_size     = document.querySelector('#div_size'),
        sel_items    = document.querySelector('#sel_items'),
        sel_sizes    = document.querySelector('#sel_sizes'),
        inp_location = document.querySelector('#inp_location'),
        inp_item     = document.querySelector('#inp_item'),
        inp_size     = document.querySelector('#inp_size');
    sel_items.setAttribute('size', 10);
    sel_items.value = '';
    sel_sizes.setAttribute('size', 10);
    sel_sizes.value = '';
    inp_location.value = '';
    div_size.classList.add('hidden');
    div_sizes.classList.add('hidden');
    inp_item.value = '';
    inp_size.value = '';
};
function showLocations(stocks, options) {
    let sel_locations = document.querySelector('#sel_locations');
    stocks.forEach(stock => {
        sel_locations.appendChild(
            new Option({
                value: stock.location_id,
                text: stock.location._location
            }).e
        );
    });
};
function getSerials(options) {
    let sel_sizes = document.querySelector('#sel_sizes');
    get(
        showSerials,
        {
            table: 'serials',
            query: [`size_id=${sel_sizes.value}`],
            options: options
        }
    )
};
function showSerials(serials, options) {
    clearElement('div_serials');
    let div_serials = document.querySelector('#div_serials'),
        _qty        = document.querySelector('#add_size_qty');
    if (div_serials && _qty) {
        let locations = [];
        if (options.options.locations) {
            locations.push({value: '', text: 'Enter manually', selected: true});
            serials.forEach(serial => {
                if (locations.filter(e => e.value === serial.location_id).length === 0) {
                    locations.push({value: serial.location_id, text: serial.location._location});
                };
            });
        };
        for (let i = 0; i < Number(_qty.value); i++) {
            div_serials.appendChild(
                new Input_Group({
                    title: `Enter Serial: ${i+1}`,
                    append: new Input({
                        name: `line[serials][][${i}][serial]`,
                        completeOff: true
                    }).e
                }).e
            );
            if (options.options.locations) {
                div_serials.appendChild(
                    new Input_Group({
                        title: `Select Location: ${i+1}`,
                        append: new Select({
                            name: `line[serials][][${i}][location_id]`,
                            size: 3,
                            required: true,
                            options: locations
                        }).e
                    }).e
                );
                div_serials.appendChild(
                    new Input_Group({
                        title: `Enter Location: ${i+1}`,
                        append: new Input({
                            name: `line[serials][][${i}][location]`,
                            completeOff: true
                        }).e
                    }).e
                );
            };
            div_serials.appendChild(document.createElement('hr'))
        };
    };
};
function add_size_modal (table, options = {}) {
    let btn_addSize = document.querySelector('#btn_addSize');
    if (btn_addSize) {
        let div_modals = document.querySelector('#div_modals');
        if (div_modals) {
            btn_addSize.addEventListener('click', () => {
                search_items();
                $('#mdl_add_size').modal('show')
            });
            div_modals.appendChild(new Modal({id:'add_size',static:true}).e);
            let mdl_title  = document.querySelector('#mdl_add_size_title'),
                mdl_body   = document.querySelector('#mdl_add_size_body'),
                mdl_header = document.querySelector('#mdl_add_size_header');
            mdl_title.innerText = `Add to ${table}`;
            mdl_title.appendChild(new Spinner({id: 'items'}).e);
            mdl_title.appendChild(new Spinner({id: 'sizes'}).e);
            let reset = document.createElement('a');
            reset.innerHTML = "<i class='fas fa-redo'></i>";
            reset.setAttribute('id', 'reset');
            reset.classList.add('float-right');
            reset.addEventListener('click', function (event) {reset_add_size()});
            mdl_header.appendChild(reset);
            let div_items = document.createElement('div'),
                div_sizes = document.createElement('div'),
                div_size  = document.createElement('div'),
                form      = document.createElement('form');
            div_items.setAttribute('id', 'div_items');
            div_sizes.setAttribute('id', 'div_sizes');
            div_size.setAttribute('id', 'div_size');
            div_sizes.classList.add('hidden');
            div_size.classList.add('hidden');
            form.setAttribute('id', 'form_line');
            div_items.appendChild(new Input_Group({
                title: 'Search Items',
                append: new Input({
                    id: 'inp_item',
                    completeOff: true
                }).e
            }).e);
            div_items.appendChild(new Input_Group({
                title: 'Item',
                append: new Select({
                    id: 'sel_items',
                    size: 10
                }).e
            }).e);
            div_sizes.appendChild(new Input_Group({
                title: 'Search Sizes',
                append: new Input({
                    id: 'inp_size',
                    completeOff: true
                }).e
            }).e);
            div_sizes.appendChild(new Input_Group({
                title: 'Size',
                append: new Select({
                    id:   'sel_sizes',
                    name: 'line[size_id]',
                    size: 10,
                    required: true
                }).e
            }).e);
            div_size.appendChild(new Input_Group({
                title: 'Qty',
                append: new Input({
                    id:       'add_size_qty',
                    type:     'number',
                    name:     'line[_qty]',
                    value:    '1',
                    min:      '1',
                    required: true
                }).e
            }).e);
            if (options.locations) {
                div_size.appendChild(
                    new Input_Group({
                        id: 'grp_sel_locations',
                        title: 'Select Location',
                        append: new Select({
                            id:   'sel_locations',
                            name: 'line[location_id]',
                            size: 3,
                            required: true
                        }).e
                    }).e
                );
                div_size.appendChild(
                    new Input_Group({
                        id: 'grp_inp_location',
                        title: 'Enter Location',
                        append: new Input({
                            id: 'inp_location',
                            name: 'line[location]',
                            completeOff: true
                        }).e
                    }).e
                );
            };
            if (options.serials) {
                let div_serials = document.createElement('div');
                div_serials.setAttribute('id', 'div_serials');
                div_size.appendChild(div_serials);
            };
            div_size.appendChild(
                new Input({
                    id: 'btn_addSize_save',
                    type: 'submit',
                    classes: ['btn', 'btn-success'],
                    value: 'Add Size'
                }).e
            );
            mdl_body.appendChild(div_items);
            form.appendChild(div_sizes);
            form.appendChild(div_size);
            form.appendChild(new Input({
                type: 'hidden',
                name: `line[${table}_id]`,
                value: path[3]
            }).e);
            mdl_body.appendChild(form);
            addFormListener('form_line', 'POST', `/stores/${table}_lines`, {onComplete: [getLines, reset_add_size]});
            document.querySelector('#inp_item').addEventListener('keyup', function (event) {searchSelect('inp_item',"sel_items")});
            document.querySelector('#inp_size').addEventListener('keyup', function (event) {searchSelect('inp_size',"sel_sizes")});
            document.querySelector('#sel_items').addEventListener('change', function (event) {search_sizes(this.value)});
            document.querySelector('#sel_sizes').addEventListener('change', show_details);
            document.querySelector('#sel_sizes').addEventListener('change', () => {
                let sel_sizes = document.querySelector('#sel_sizes');
                get(
                    showSize,
                    {
                        table: 'sizes',
                        query: [`size_id=${sel_sizes.value}`],
                        options: options
                    }
                );
            });
        } else console.log('div_modals not found');
    } else console.log('btn_addSize not found');
};