module.exports = (inc, m) => {
    inc.user = (options = {}) => {
        return {
            model:   m.users,
            as:      options.as || 'user',
            include: [{model: m.ranks, as: 'rank'}]
        };
    };
    inc.item = (options = {}) => {
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
    inc.session = (options = {}) => {
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
    inc.sale = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.session) include.push(inc.session());
            if (options.lines)   include.push(inc.sale_lines());
        };
        include.push(inc.user());
        return {
            model:    m.sales,
            include:  include,
            as:       options.as       || 'sale',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.holding = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.holdings,
            as:      options.as || 'holding',
            include: include
        };
    };
    
    inc.users = (options = {}) => {
        let include = options.include || [m.users.ranks];
        return {
            model:   m.users,
            as:      options.as || 'user',
            include: include
        };
    };
    inc.pos_pages = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.pos_pages,
            as:      options.as || 'page',
            include: include
        };
    };
    inc.movements = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.movements,
            as:      options.as || 'movement',
            include: include
        };
    };
    inc.holdings = (options = {}) => {
        let include = options.include || [];
        return {
            model:   m.holdings,
            as:      options.as || 'holding',
            include: include
        };
    };
    inc.pos_layouts = (options = {}) => {
        let include = options.include || [inc.items()];
        return {
            model:   m.pos_layouts,
            as:      options.as || 'items',
            include: include
        };
    };
    inc.sale_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.sale) include.push(inc.sale());
            if (options.item) include.push(inc.item());
        };
        return {
            model:    m.sale_lines,
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
            model:    m.sales,
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
            model:    m.receipts,
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
            model:    m.writeoffs,
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
            model:    m.canteen_items,
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
            model:    m.sessions,
            include:  include,
            as:       options.as       || 'session',
            where:    options.where    || null,
            required: options.required || false
        };
    };
};