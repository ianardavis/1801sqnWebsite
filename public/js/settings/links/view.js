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
                    addCell(row, {text: heading.heading});
                    addCell(row, {append:
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
            return null;
        });
    })
    .then(getLinks);
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
                    addCell(row, {text: link.title});
                    addCell(row, {text: link.text});
                    addCell(row, {append:
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
function viewHeading(event) {
    get({
        table: 'resource_link_heading',
        where: {resource_link_heading_id: event.relatedTarget.dataset.id}
    })
    .then(function([heading, options]) {
        setInnerText('resource_link_heading_id', heading.resource_link_heading_id);
        setInnerText('link_heading',             heading.heading);
        setInnerText('link_createdAt',           printDate(heading.createdAt, true));
        setInnerText('link_updatedAt',           printDate(heading.updatedAt, true));
    });
};
function viewLink(event) {
    get({
        table: 'resource_link',
        where: {resource_link_id: event.relatedTarget.dataset.id}
    })
    .then(function([link, options]) {
        setInnerText('resource_link_id', link.resource_link_id);
        setInnerText('link_heading',     link.heading);
        setInnerText('link_title',       link.title);
        setInnerText('link_text',        link.text);
        setInnerText('link_href',        link.href);
        setInnerText('link_createdAt', printDate(link.createdAt, true));
        setInnerText('link_updatedAt', printDate(link.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getLinks);
    addSortListeners('resource_links',         getLinks);
    addSortListeners('resource_link_headings', getHeadings);
    modalOnShow('link_view',         viewLink);
    modalOnShow('link_heading_view', viewHeading);
    getHeadings();
});