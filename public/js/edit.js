edit = (table, id, options = {}) => {
    let heights = {
            files: '708',
            suppliers: '555',
            accounts: '236',
            items: '405',
            sizes: '629',
            nsns: '200',
            serials: '192'
        },
        widths = {},
        queries = '',
        editWindow = null;
    if (options.queries) queries = options.queries;
    editWindow = window.open('/stores/' + table + '/' + id + '/edit?' + queries,
                            table + '_edit_' + id,
                            'width=' + (options.width || widths[table] || '600') + ',height=' + (options.height || heights[table] || '600') + ',resizeable=no,location=no');
};