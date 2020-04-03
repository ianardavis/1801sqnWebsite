module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = options.include || [m.ranks];
        return {
            model:   m.users,
            as:      options.as || 'user',
            include: include
        };
    };
    inc.canteen_sale_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.sale) include.push(inc.canteen_sales({as: 'sale'}));
            if (options.item) include.push(inc.canteen_items());
        };
        return {
            model:    m.canteen_sale_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.canteen_sales = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.lines) include.push(inc.canteen_sale_lines());
        };
        include.push(inc.users());
        return {
            model:    m.canteen_sales,
            include:  include,
            as:       options.as       || 'sales',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.canteen_receipt_lines = (options = {}) => {
        let include = [inc.canteen_items()];
        if (options.include) include = options.include
        else {
            if (options.receipt) include.push(inc.canteen_receipts({as: 'receipt'}));
        };
        return {
            model:    m.canteen_receipt_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.canteen_receipts = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.lines) include.push(inc.canteen_receipt_lines());
        };
        include.push(inc.users());
        return {
            model:    m.canteen_receipts,
            include:  include,
            as:       options.as       || 'receipts',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.canteen_writeoff_lines = (options = {}) => {
        let include = [inc.canteen_items()];
        if (options.include) include = options.include
        else {
            if (options.writeoff) include.push(inc.canteen_writeoffs({as: 'writeoff'}));
        };
        return {
            model:    m.canteen_writeoff_lines,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.canteen_writeoffs = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.lines) include.push(inc.canteen_writeoff_lines());
        };
        include.push(inc.users());
        return {
            model:    m.canteen_writeoffs,
            include:  include,
            as:       options.as       || 'writeoffs',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.canteen_items = (options = {}) => {
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
};