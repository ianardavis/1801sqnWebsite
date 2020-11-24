function showPages(pages, options) {
    let tab_headers = document.querySelector('#tab_headers'),
        tab_pages   = document.querySelector('#tab_pages');
    tab_headers.innerHTML = '';
    tab_pages.innerHTML = '';
    pages.forEach(page => {
        let li = document.createElement('li'),
            a  = document.createElement('a');
        li.classList.add('nav_item');
        a.classList.add('nav-link', 'btn', 'btn-lg', 'btn-info', 'm-2', 'w-100-px');
        a.setAttribute('id', `page_${page.page_id}-tab`);
        a.setAttribute('data-toggle', 'tab');
        a.setAttribute('href', `#page_${page.page_id}`);
        a.setAttribute('role', 'tab');
        a.setAttribute('aria-controls', `page_${page.page_id}`);
        a.setAttribute('aria-selected', 'true');
        a.innerText = page._title;
        li.appendChild(a);
        tab_headers.appendChild(li);
        let pane = document.createElement('div'),
            pane_items = document.createElement('div');
        pane_items.classList.add('row', 'h-150-px');
        pane.classList.add('tab-pane', 'fade');
        pane.setAttribute('id', `page_${page.page_id}`);
        pane.setAttribute('role', 'tabpanel');
        pane.setAttribute('aria-labelledby', `page_${page.page_id}-tab`);
        page.items.forEach(item => {
            let form   = document.createElement('form'),
                button = document.createElement('button');
            form.setAttribute('id', `form_${item.item_id}`);
            form.classList.add('col-6', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2', 'h-100');
            button.classList.add('w-100', 'h-100', 'btn', 'btn-primary');
            let button_text = `${item.item._name}`;
            if (item.item_id !== 0) button_text += `\n£${Number(item.item._price).toFixed(2)}`
            button.innerText = button_text;
            form.appendChild(button);
            form.appendChild(new Input({type: 'hidden', name: 'line[sale_id]', value: '', classes: ['sale_id']}).e);
            form.appendChild(new Input({type: 'hidden', name: 'line[item_id]', value: String(item.item_id)}).e);
            pane_items.appendChild(form);
            form.addEventListener("submit", event => {
                event.preventDefault();
                sendData(form, 'POST', "/canteen/sale_lines", {onComplete: getSaleLines, noConfirm: true});
            });
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
};