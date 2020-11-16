module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = options.include || [m.users.ranks];
        return {
            model:   m.users.users,
            as:      options.as || 'user',
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
            if (options.lines) include.push(inc.sale_lines());
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
    
    inc.receipt_lines = (options = {}) => {
        let include = [inc.items()];
        if (options.include) include = options.include
        else {
            if (options.receipt) include.push(inc.receipts({as: 'receipt'}));
        };
        return {
            model:    m.canteen.receipt_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.receipts = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.lines) include.push(inc.receipt_lines());
        };
        include.push(inc.users());
        return {
            model:    m.canteen.receipts,
            include:  include,
            as:       options.as       || 'receipts',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.writeoff_lines = (options = {}) => {
        let include = [inc.items()];
        if (options.include) include = options.include
        else {
            if (options.writeoff) include.push(inc.writeoffs({as: 'writeoff'}));
        };
        return {
            model:    m.canteen.writeoff_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.writeoffs = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.lines) include.push(inc.writeoff_lines());
        };
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