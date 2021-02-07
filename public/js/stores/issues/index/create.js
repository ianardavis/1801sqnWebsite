function reset_issue_add() {
    let div_sizes   = document.querySelector('#div_sizes'),
        div_items   = document.querySelector('#div_items'),
        div_details = document.querySelector('#div_details'),
        sel_items   = document.querySelector('#sel_items'),
        sel_sizes   = document.querySelector('#sel_sizes'),
        inp_item    = document.querySelector('#inp_item'),
        inp_size    = document.querySelector('#inp_size');
    div_details.classList.add('hidden');
    div_sizes.classList.add('hidden');
    div_items.classList.add('hidden');
    sel_items.setAttribute('size', 10);
    sel_items.value = '';
    sel_items.innerHTML = '';
    sel_sizes.setAttribute('size', 10);
    sel_sizes.value = '';
    sel_sizes.innerHTML = '';
    inp_item.value = '';
    inp_size.value = '';
    getUsers();
};
function getUsers () {
    get(
        {
            table: 'users',
            query: []
        },
        function (users, options) {
            let sel_users = document.querySelector('#sel_users');
            if (sel_users) {
                sel_users.innerHTML = '';
                sel_users.appendChild(new Option({text: 'Select...', selected: true}).e);
                users.forEach(user => {
                    sel_users.appendChild(new Option({
                        value: user.user_id,
                        text: print_user(user)
                    }).e)
                });
            };
        }
    );
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
    get(
        {
            table: 'items',
            query: []
        },
        function (items, options) {
            let sel_items = document.querySelector('#sel_items');
            if (sel_items) {
                sel_items.innerHTML = '';
                items.forEach(item => {
                    sel_items.appendChild(
                        new Option({
                            text: item._description,
                            value: item.item_id
                        }).e
                    );
                });
            } else console.log('sel_items not found');
        }
    );
};
function getSizes(event) {
    get(
        {
            table: 'sizes',
            query: [`item_id=${event.target.value}`, '_issueable=1']
        },
        function (sizes, options) {
            let sel_sizes = document.querySelector('#sel_sizes'),
                div_sizes = document.querySelector('#div_sizes'),
                sel_items = document.querySelector('#sel_items');
            if (sel_sizes) {
                sel_sizes.innerHTML = '';
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
            } else console.log('sel_sizes note found');
        }
    );
};
function show_details() {
    let sel_sizes = document.querySelector('#sel_sizes'),
        div_details  = document.querySelector('#div_details');
    if (sel_sizes) {
        if (div_details) div_details.classList.remove('hidden');
        if (sel_sizes) sel_sizes.removeAttribute('size');
    } else console.log('sel_sizes not found');
};
window.addEventListener('load', function () {
    $('#mdl_issue_add').on('show.bs.modal', getUsers);
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
    document.querySelector('#reload_add').addEventListener('click', reset_issue_add);
    document.querySelector('#inp_item')  .addEventListener('keyup', function () {searchSelect('inp_item',"sel_items")});
    document.querySelector('#inp_size')  .addEventListener('keyup', function () {searchSelect('inp_size',"sel_sizes")});
    document.querySelector('#sel_items') .addEventListener('change', getSizes);
    document.querySelector('#sel_sizes') .addEventListener('change', show_details);
    document.querySelector('#sel_users') .addEventListener('change', show_items);
});