function getHeadings() {
    clear('tbl_resource_link_headings')
    .then(tbl_link_headings => {
        get({
            table: 'resource_link_headings',
            func: getHeadings
        })
        .then(function ([results, options]) {
            if (results.resource_link_headings && results.resource_link_headings.length > 0) {
                results.resource_link_headings.forEach(link => {
                    let row = tbl_link_headings.insertRow(-1);
                    add_cell(row, {text: link.heading});
                    add_cell(row)
                });
            };
            if (typeof linkHeadingsEditBtns === 'function') linkHeadingsEditBtns();
        });
    });
};
function getLinks() {
    clear('tbl_resource_links')
    .then(tbl_links => {
        get({
            table: 'resource_links',
            func: getLinks
        })
        .then(function ([results, options]) {
            if (results.resource_links && results.resource_links.length > 0) {
                results.resource_links.forEach(link => {
                    let row = tbl_links.insertRow(-1);
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
        set_innerText('link_heading',     link.heading);
        set_innerText('link_title',       link.title);
        set_innerText('link_text',        link.text);
        set_innerText('link_href',        link.href);
        set_innerText('link_createdAt', print_date(link.createdAt, true));
        set_innerText('link_updatedAt', print_date(link.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLinks);
    add_sort_listeners('resource_links', getLinks);
    add_sort_listeners('resource_link_headings', getHeadings);
    modalOnShow('link_view', function (event) {viewLink(event.relatedTarget.dataset.id)});
    getHeadings();
});