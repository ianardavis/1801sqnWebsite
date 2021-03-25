module.exports = (inc, m) => {
    function template (options) {
        return {
            model:      options.table,
            as:         options.as         || options.table.tablename,
            attributes: options.attributes || null,
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    
    inc.actions = (options = {}) => {
        let include = [];
        include.push(inc.users());
        return {
            model:      m.actions,
            attributes: options.attributes || null,
            include:    include,
            as:         options.as         || 'actions',
            where:      options.where      || null,
            required:   options.required   || false
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
    inc.adjusts = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else include.push(inc.users());
        return {
            model:    m.adjusts,
            attributes: options.attributes || null,
            as:       options.as           || 'adjusts',
            include:  include,
            required: options.required     || false,
            where:    options.where        || null
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
    inc.demand_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        if (options.demands) include.push(inc.demands());
        if (options.sizes)   include.push(inc.sizes());
        return {
            model:    m.demand_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as           || 'lines',
            where:    options.where        || null,
            required: options.required     || false
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
            as:       options.as           || 'demand',
            where:    options.where        || null,
            required: options.required     || false
        };
    };
    inc.details = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:      m.details,
            attributes: options.attributes || null,
            include:    include,
            as:         options.as         || 'details',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.embodiments = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            if (options.parent) include.push(inc.sizes({as: 'parent'}));
            if (options.child)  include.push(inc.sizes({as: 'child'}));
        };
        return {
            model:      m.embodiments,
            attributes: options.attributes || null,
            as:         options.as         || 'embodiments',
            include:    include,
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.files = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:      m.files,
            include:    include,
            attributes: options.attributes || null,
            as:         options.as         || 'files',
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.file_details = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:      m.file_details,
            include:    include,
            attributes: options.attributes || null,
            as:         options.as         || 'details',
            where:      options.where      || null,
            required:   options.required   || false
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
    inc.issues = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        include.push(inc.users({as: 'user_issue'}));
        include.push(inc.users({as: 'user'}));
        return {
            model:    m.issues,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as           || 'issue',
            where:    options.where        || null,
            required: options.required     || false
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
    inc.loancard_lines = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else include.push(inc.loancards())
        return {
            model:    m.loancard_lines,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as           || 'lines',
            where:    options.where        || null,
            required: options.required     || false
        };
    };
    inc.loancards = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
        };
        return {
            model:    m.loancards,
            attributes: options.attributes || null,
            include:  include,
            as:       options.as           || 'loancard',
            where:    options.where        || null,
            required: options.required     || false
        };
    };
    inc.locations = (options = {}) => {
        let include = [];
        if (options.include) include = options.include;
        return {
            model:    m.locations,
            attributes: options.attributes || null,
            as:       options.as           || 'locations',
            include:  include,
            where:    options.where        || null,
            required: options.required     || false
        };
    };
    inc.nsn_classes = (options = {}) => {
        return {
            model:      m.nsn_classes,
            attributes: options.attributes || {exclude: ['createdAt', 'updatedAt']},
            as:         options.as         || 'class',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.nsn_countries = (options = {}) => {
        return {
            model:      m.nsn_countries,
            attributes: options.attributes || {exclude: ['createdAt', 'updatedAt']},
            as:         options.as         || 'country',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.nsn_groups = (options = {}) => {
        return {
            model:      m.nsn_groups,
            attributes: options.attributes || {exclude: ['createdAt', 'updatedAt']},
            as:         options.as         || 'group',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
    inc.nsns = (options = {}) => {
        let include = [
            inc.nsn_groups(),
            inc.nsn_classes(),
            inc.nsn_countries()
        ]
        return {
            model:      m.nsns,
            attributes: options.attributes || null,
            include:    include,
            as:         options.as         || 'nsns',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.orders = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.users({as: 'user'}));
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
    inc.serials = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else include.push(inc.locations({as: 'location'}));
        return {
            model:    m.serials,
            attributes: options.attributes || null,
            as:       options.as           || 'serials',
            include:  include,
            required: options.required     || false,
            where:    options.where        || null
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
    inc.stocks = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(inc.locations({as: 'location', required: options.require_locations || false}));
            if (options.size) include.push(inc.sizes());
        };
        return {
            model:      m.stocks,
            attributes: options.attributes || null,
            as:         options.as         || 'stocks',
            include:    include,
            where:      options.where      || null,
            required:   options.required   || false
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

    inc.users = (options = {}) => {
        let include = [];
        if (options.include) options.include;
        include.push(inc.ranks());
        return {
            model:      m.users.users,
            include:    include,
            attributes: options.attributes || ['full_name'],
            as:         options.as         || 'user',
            where:      options.where      || null,
            required:   options.required   || false
        };
    };
    inc.ranks = (options = {}) => {
        return {
            model:      m.users.ranks,
            attributes: options.attributes || ['_rank'],
            as:         options.as         || 'rank',
            include:    options.include    || [],
            required:   options.required   || false,
            where:      options.where      || null
        };
    };
};