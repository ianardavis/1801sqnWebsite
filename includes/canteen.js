module.exports = (m, fn) => {
    fn.inc.canteen = {};
    fn.inc.canteen.item = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.canteen_items,
            include:  include,
            as:       options.as       || 'item',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    fn.inc.canteen.session = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.sessions,
            include:  include,
            as:       options.as       || 'session',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    fn.inc.canteen.sale = (options = {}) => {
        let include = [];
        if (options.session) include.push(fn.inc.canteen.session());
        include.push(fn.inc.users.user());
        return {
            model:    m.sales,
            include:  include,
            as:       'sale',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    fn.inc.canteen.holding = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.holdings,
            as:      options.as || 'holding',
            include: include
        };
    };
    
    fn.inc.canteen.sale_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.sale) include.push(fn.inc.canteen.sale());
            if (options.item) include.push(fn.inc.canteen.item());
        };
        return {
            model:    m.sale_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
};