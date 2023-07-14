function getLinks() {
    clear('tbl_links')
    .then(tbl_links => {
        get({
            table: 'resource_links'
        })
        .then(function ([links, options]) {
            if (links && links.length > 0) {
                links.forEach(link => {
                    let row = tbl_links.insertRow(-1);
                    add_cell(row, {text: link.heading});
                    add_cell(row, {text: link.title});
                    add_cell(row, {text: link.text});
                    add_cell(row, {append:
                        new Modal_Button(
                            _search(),
                            'link_view',
                            [{
                                field: 'id',
                                value: link.resource_link_id
                            }]
                        ).e
                    })
                });
            };
            if (typeof linksEditBtns === 'function') linksEditBtns();
        });
    });
};
function viewLink(resource_link_id) {
    get({
        table: 'resource_link',
        where: {resource_link_id: resource_link_id}
    })
    .then(function([link, options]) {
        set_innerText('resource_link_id', link.resource_link_id);
        set_innerText('link_heading', link.heading);
        set_innerText('link_title', link.title);
        set_innerText('link_text',  link.text);
        set_innerText('link_href',  link.href);
        set_innerText('link_createdAt', print_date(link.createdAt, true));
        set_innerText('link_updatedAt', print_date(link.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLinks);
    modalOnShow('link_view', function (event) {viewLink(event.relatedTarget.dataset.id)});
    add_sort_listeners('links', getLinks);
    getLinks();
});