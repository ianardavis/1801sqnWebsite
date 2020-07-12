module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = [];
        if (options.include) options.include;
        include.push(inc.ranks());
        return {
            model:      m.users,
            include:    include,
            attributes: options.attributes || null,
            as:         options.as         || 'user',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.stock = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.locations({as: 'location', required: options.require_locations || false}));
            if (options.size) include.push(inc.sizes());
        };
        return {
            model:    m.stock,
            attributes: options.attributes || null,
            as:       options.as       || 'stocks',
            include:  include,
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.locations = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.locations,
            attributes: options.attributes || null,
            as:       options.as       || 'locations',
            include:  include,
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.sizes = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(m.items)
            if (options.stock)   include.push(inc.stock());
            if (options.nsns)    include.push(inc.nsns());
            if (options.serials) include.push(inc.serials());
        };
        return {
            model:      m.sizes,
            include:    include,
            as:         options.as         || 'size',
            where:      options.where      || null,
            required:   options.required   || false,
            attributes: options.attributes || null
        };
    };
    inc.items = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.sizes) include.push(inc.sizes());
        };
        return {
            model:      m.items,
            attributes: options.attributes || null,
            as:         options.as         || 'item',
            include:    include,
            where:      options.where      || null,
            required:   options.required   || false
        };
    };

    inc.nsns = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:    m.nsns,
            attributes: options.attributes || null,
            as:       options.as       || 'nsns',
            include:  include,
            required: options.required || false,
            where:    options.where    || null
        };
    };
    inc.adjusts = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users());
        };
        return {
            model:    m.adjusts,
            attributes: options.attributes || null,
            as:       options.as       || 'adjusts',
            include:  include,
            required: options.required || false,
            where:    options.where    || null
        };
    };
    inc.serials = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:    m.serials,
            attributes: options.attributes || null,
            as:       options.as       || 'serials',
            include:  include,
            required: options.required || false,
            where:    options.where    || null
        };
    };
    inc.accounts = (options = {}) => {
        let include = [];
        include.push(inc.users())
        return {
            model:      m.accounts,
            include:    include,
            attributes: options.attributes || null,
            as:         options.as         || 'account',
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.files = (options = {}) => {
        return {
            model:      m.files,
            attributes: options.attributes || null,
            as:         options.as         || 'file',
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.categories = (options = {}) => {
        return {
            model:      m.categories,
            attributes: options.attributes || ['category_id', '_category'],
            as:         options.as         || 'category',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.groups = (options = {}) => {
        return {
            model:      m.groups,
            attributes: options.attributes || ['group_id', '_group'],
            as:         options.as         || 'group',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.types = (options = {}) => {
        return {
            model:      m.types,
            attributes: options.attributes || ['type_id', '_type'],
            as:         options.as         || 'type',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.subtypes = (options = {}) => {
        return {
            model:      m.subtypes,
            attributes: options.attributes || ['subtype_id', '_subtype'],
            as:         options.as         || 'subtype',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.genders = (options = {}) => {
        return {
            model:      m.genders,
            attributes: options.attributes || ['gender_id', '_gender'],
            as:         options.as         || 'gender',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.ranks = (options = {}) => {
        return {
            model:      m.ranks,
            attributes: options.attributes || ['rank_id', '_rank'],
            as:         options.as         || 'rank',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.suppliers = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        if (options.file)    include.push(inc.files())
        if (options.account) include.push(inc.accounts())
        return {
            model:    m.suppliers,
            attributes: options.attributes || null,
            as:       options.as       || 'suppliers',
            include:  include,
            required: options.required || false,
            where:    options.where    || null
        };
    };

    inc.request_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.requests) include.push(inc.requests());
        };
        return {
            model:    m.request_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.requests = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users({as: '_for'}));
            include.push(inc.users({as: '_by'}));
            if (options.lines) include.push(inc.request_lines());
        };
        return {
            model:    m.requests,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'request',
            where:    options.where    || null,
            required: options.required || false
        };
    };

    inc.order_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.orders) include.push(inc.orders());
        };
        return {
            model:    m.order_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.orders = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users({as: '_for'}));
            include.push(inc.users({as: '_by'}));
            if (options.lines) include.push(inc.order_lines());
        };
        return {
            model:    m.orders,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'order',
            where:    options.where    || null,
            required: options.required || false
        };
    };

    inc.demand_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.demands) include.push(inc.demands());
            if (options.sizes) include.push(inc.sizes());
        };
        return {
            model:    m.demand_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.demands = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users());
            if (options.lines) include.push(inc.demand_lines());
        };
        return {
            model:    m.demands,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'demand',
            where:    options.where    || null,
            required: options.required || false
        };
    };

    inc.receipt_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.receipts) include.push(inc.receipts());
        };
        return {
            model:    m.receipt_lines,
            attributes: options.attributes || null,
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
            include.push(inc.users());
            if (options.lines) include.push(inc.receipt_lines());
        };
        return {
            model:    m.receipts,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'receipt',
            where:    options.where    || null,
            required: options.required || false
        };
    };

    inc.issue_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.issues) include.push(inc.issues());
        };
        return {
            model:    m.issue_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.issues = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users({as: '_to'}));
            include.push(inc.users({as: '_by'}));
            if (options.lines) include.push(inc.issue_lines());
        };
        return {
            model:    m.issues,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'issue',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
    inc.return_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.issues) include.push(inc.returns());
        };
        return {
            model:    m.return_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'lines',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.returns = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users({as: '_by'}));
            include.push(inc.users({as: '_from'}));
            if (options.lines) include.push(inc.return_lines());
        };
        return {
            model:    m.returns,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as       || 'return',
            where:    options.where    || null,
            required: options.required || false
        };
    };
};