add = (table, options = {}) => {
    let heights = {
            suppliers: '572',
            accounts:  '235',
            serials:   '192',
            adjusts:   '361',
            items:     '440',
            sizes:     '629',
            users:     '445',
            nsns:      '210'
        },
        widths    = {},
        queries   = '',
        addWindow = null;
    if (options.queries) queries = options.queries;
    addWindow = window.open('/stores/' + table + '/new?' + queries,
                            table + '_add',
                            'width=' + (options.width || widths[table] || '600') + ',height=' + (options.height || heights[table] || '600') + ',resizeable=no,location=no');
};