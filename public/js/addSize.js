function search_items () {
    get(
        item_search_results,
        {
            table: 'items',
            query: []
        }
    );
};
function item_search_results (items, options) {
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
};
function search_sizes (item_id) {
    get(
        size_search_results,
        {
            table: 'sizes',
            query: [`item_id=${item_id}`]
        }
    );
};
function size_search_results (sizes, options) {
    let sel_sizes = document.querySelector('#sel_sizes'),
        div_sizes = document.querySelector('#div_sizes'),
        sel_items = document.querySelector('#sel_items');
    if (sel_sizes) {
        if (div_sizes) div_sizes.classList.remove('hidden');
        if (sel_items) sel_items.removeAttribute('size');
        sel_sizes.innerHTML = '';
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
};
function show_details () {
    let sel_sizes = document.querySelector('#sel_sizes'),
        div_size  = document.querySelector('#div_size');
    if (sel_sizes) {
        if (div_size) div_size.classList.remove('hidden');
        if (sel_sizes) sel_sizes.removeAttribute('size');
    } else console.log('sel_sizes note found');
};
function reset_add_size () {
    let div_sizes = document.querySelector('#div_sizes'),
        div_size  = document.querySelector('#div_size'),
        sel_items = document.querySelector('#sel_items'),
        sel_sizes = document.querySelector('#sel_sizes'),
        inp_item  = document.querySelector('#inp_item'),
        inp_size  = document.querySelector('#inp_size');
    sel_items.setAttribute('size', 10);
    sel_items.value = '';
    sel_sizes.setAttribute('size', 10);
    sel_sizes.value = '';
    div_size.classList.add('hidden');
    div_sizes.classList.add('hidden');
    inp_item.value = '';
    inp_size.value = '';
};
function add_size_modal (table) {
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
            mdl_title.innerText = 'Add Size';
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
                input: new Input({
                    id: 'inp_item',
                    completeOff: true
                }).e
            }).e);
            div_items.appendChild(new Input_Group({title: 'Item', input: new Select({
                id: 'sel_items',
                size: 10
            }).e}).e);
            div_sizes.appendChild(new Input_Group({
                title: 'Search Sizes',
                input: new Input({
                    id: 'inp_size',
                    completeOff: true
                }).e
            }).e);
            div_sizes.appendChild(new Input_Group({title: 'Size', input: new Select({
                id:   'sel_sizes',
                name: 'line[size_id]',
                size: 10,
                required: true
            }).e}).e);
            div_size.appendChild(new Input_Group({
                title: 'Qty',
                input: new Input({
                    type: 'number',
                    name: 'line[_qty]',
                    value: '1',
                    required: true
                }).e
            }).e);
            div_size.appendChild(
                new Input({
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
        } else console.log('div_modals not found');
    } else console.log('btn_addSize not found');
};