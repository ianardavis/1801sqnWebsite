module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = options.include || [m.users.ranks];
        return {
            model:   m.users.users,
            as:      options.as || 'user',
            include: include
        };
    };
    inc.pos_pages = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.canteen.pos_pages,
            as:      options.as || 'page',
            include: include
        };
    };
    inc.movements = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.canteen.movements,
            as:      options.as || 'movement',
            include: include
        };
    };
    inc.holdings = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.canteen.holdings,
            as:      options.as || 'holding',
            include: include
        };
    };
    inc.pos_layouts = (options = {}) => {
        let include = options.include || [inc.items()];
        return {
            model:   m.canteen.pos_layouts,
            as:      options.as || 'items',
            include: include
        };
    };
    inc.sale_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.sale) include.push(inc.sales({as: 'sale'}));
            if (options.item) include.push(inc.items());
        };
        return {
            model:    m.canteen.sale_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.sales = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.session) include.push(inc.sessions());
            if (options.lines)   include.push(inc.sale_lines());
        };
        include.push(inc.users());
        return {
            model:    m.canteen.sales,
            include:  include,
            as:       options.as       || 'sales',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.receipts = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        include.push(inc.users());
        return {
            model:    m.canteen.receipts,
            include:  include,
            as:       options.as       || 'receipts',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.writeoffs = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        include.push(inc.users());
        return {
            model:    m.canteen.writeoffs,
            include:  include,
            as:       options.as       || 'writeoffs',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.items = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.canteen.items,
            include:  include,
            as:       options.as       || 'item',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.sessions = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.canteen.sessions,
            include:  include,
            as:       options.as       || 'session',
            where:    options.where    || null,
            required: options.required || false
        };
    };
};