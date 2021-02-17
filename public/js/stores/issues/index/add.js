function reset_issue_add() {
    hide('div_sizes');
    hide('div_details');
    ['sel_items', 'sel_sizes'].forEach(e => {
        let ele = document.querySelector(`#${e}`);
        ele.setAttribute('size', 10);
        ele.value = '';
        ele.innerHTML = '';
    });
    getItems()
    set_value({id: 'inp_item', value: ''});
    set_value({id: 'inp_size', value: ''});
};
function show_items(select) {
    if (select.target.value === 'Select...') reset_issue_add()
    else {
        let div_items = document.querySelector('#div_items');
        div_items.classList.remove('hidden');
        getItems();
    }
}
function getItems() {
    let sel_items = document.querySelector('#sel_items');
    if (sel_items) {
        sel_items.innerHTML = '';
        get(
            {table: 'items'},
            function (items, options) {
                items.forEach(item => {
                    sel_items.appendChild(
                        new Option({
                            text: item._description,
                            value: item.item_id
                        }).e
                    );
                });
            }
        );
    } else console.log('sel_items not found');
};
function getSizes(event) {
    let sel_sizes = document.querySelector('#sel_sizes');
    if (sel_sizes) {
        sel_sizes.innerHTML = '';
        get(
            {
                table: 'sizes',
                query: [`item_id=${event.target.value}`, '_issueable=1']
            },
            function (sizes, options) {
                let div_sizes = document.querySelector('#div_sizes'),
                    sel_items = document.querySelector('#sel_items');
                if (div_sizes) div_sizes.classList.remove('hidden');
                if (sel_items) sel_items.removeAttribute('size');
                sizes.forEach(size => {
                    sel_sizes.appendChild(
                        new Option({
                            text: size._size,
                            value: size.size_id
                        }).e
                    );
                });
            }
        );
    } else console.log('sel_sizes note found');
};
function show_details() {
    let sel_sizes = document.querySelector('#sel_sizes');
    if (sel_sizes) {
        show('div_details');
        if (sel_sizes) sel_sizes.removeAttribute('size');
    } else console.log('sel_sizes not found');
};
function getUsersAdd() {
    listUsers({
        select:   'sel_users_add',
        table:    'current',
        id_only:   true,
        blank:     true,
        blank_opt: {text: '... Select User', selected: true},
        spinner:   'users_add'
    });
    reset_issue_add();
};
window.addEventListener('load', function () {
    $('#mdl_issue_add').on('show.bs.modal', getUsersAdd);
    $('#mdl_issue_add').on('show.bs.modal', reset_issue_add);
    addFormListener(
        'line',
        'POST',
        `/stores/issues`,
        {
            onComplete: [
                function () {
                    getIssues('0')
                    getIssues('1')
                    getIssues('2')
                    getIssues('3')
                    getIssues('4')
                    getIssues('5')
                },
                reset_issue_add
            ]
        }
    );
    document.querySelector('#reload_users_add').addEventListener('click',  getUsersAdd);
    document.querySelector('#reload_add')      .addEventListener('click',  reset_issue_add);
    document.querySelector('#inp_item')        .addEventListener('keyup',  function () {searchSelect('inp_item',"sel_items")});
    document.querySelector('#inp_size')        .addEventListener('keyup',  function () {searchSelect('inp_size',"sel_sizes")});
    document.querySelector('#sel_items')       .addEventListener('change', getSizes);
    document.querySelector('#sel_sizes')       .addEventListener('change', show_details);
    document.querySelector('#sel_users_add')   .addEventListener('change', show_items);
});