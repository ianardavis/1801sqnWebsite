add = (table, options = {}) => {
    let heights = {
            suppliers: '572',
            accounts: '235',
            items: '440',
            sizes: '629',
            nsns: '210',
            serials: '192',
            adjusts: '361',
            users: '445'
        },
        widths = {},
        queries = '',
        addWindow = null;
    if (options.queries) queries = options.queries;
    addWindow = window.open('/stores/' + table + '/new?' + queries,
                            table + '_add',
                            'width=' + (options.width || widths[table] || '600') + ',height=' + (options.height || heights[table] || '600') + ',resizeable=no,location=no');
};