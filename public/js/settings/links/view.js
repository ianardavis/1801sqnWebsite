function getHeadings() {
    clear('tbl_resource_link_headings')
    .then(tbl_link_headings => {
        get({
            table: 'resource_link_headings',
            func: getHeadings
        })
        .then(function ([results, options]) {
            if (results.resource_link_headings && results.resource_link_headings.length > 0) {
                results.resource_link_headings.forEach(heading => {
                    let row = tbl_link_headings.insertRow(-1);
                    selectableRow(row, heading.resource_link_heading_id, tbl_link_headings, getLinks);
                    add_cell(row, {text: heading.heading});
                    add_cell(row, {append:
                        new Modal_Button(
                            _search(),
                            'link_heading_view',
                            [{
                                field: 'id',
                                value: heading.resource_link_heading_id
                            }]
                        ).e
                    });
                });
            };
        });
    });
};
function getLinks() {
    clear('tbl_resource_links')
    .then(tbl_links => {
        let selected_item = document.querySelector('.selected_row');
        let where = {};
        if (selected_item) where.resource_link_heading_id = selected_item.dataset.row_id;
        get({
            table: 'resource_links',
            where: where,
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
                    });
                });
            };
            if (typeof linksEditBtns === 'function') linksEditBtns();
        });
    });
};
function viewHeading(resource_link_heading_id) {
    get({
        table: 'resource_link_heading',
        where: {resource_link_heading_id: resource_link_heading_id}
    })
    .then(function([heading, options]) {
        setInnerText('resource_link_heading_id', heading.resource_link_heading_id);
        setInnerText('link_heading',             heading.heading);
        setInnerText('link_createdAt',           print_date(heading.createdAt, true));
        setInnerText('link_updatedAt',           print_date(heading.updatedAt, true));
    });
};
function viewLink(resource_link_id) {
    get({
        table: 'resource_link',
        where: {resource_link_id: resource_link_id}
    })
    .then(function([link, options]) {
        setInnerText('resource_link_id', link.resource_link_id);
        setInnerText('link_heading',     link.heading);
        setInnerText('link_title',       link.title);
        setInnerText('link_text',        link.text);
        setInnerText('link_href',        link.href);
        setInnerText('link_createdAt', print_date(link.createdAt, true));
        setInnerText('link_updatedAt', print_date(link.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLinks);
    add_sort_listeners('resource_links', getLinks);
    add_sort_listeners('resource_link_headings', getHeadings);
    modalOnShow('link_view', function (event) {viewLink(event.relatedTarget.dataset.id)});
    modalOnShow('link_heading_view', function (event) {viewHeading(event.relatedTarget.dataset.id)});
    getHeadings();
});