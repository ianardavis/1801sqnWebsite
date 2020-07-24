show = (table, id, options = {}) => {
    let heights = {
            accounts: '300',
            files: '708',
            nsns: '291',
            serials: '206'
        },
        widths = {},
        queries = '',
        showWindow = null;
    if (options.queries) queries = options.queries;
    showWindow = window.open('/stores/' + table + '/' + id + '?' + queries,
                            table + '_show_' + id,
                            'width=' + (options.width || widths[table] || '600') + ',height=' + (options.height || heights[table] || '600') + ',resizeable=no,location=no');
};