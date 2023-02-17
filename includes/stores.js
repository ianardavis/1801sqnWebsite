module.exports = (m, fn) => {
    fn.inc.stores = {};
    fn.inc.stores.actions = (options = {}) => {
        return {
            where:    options.where || null,
            model:    m.actions,
            as:       'action',
            required: true,
            include:  options.include || []
        };
    };
    fn.inc.stores.action_links = (options = {}) => {
        return {
            where:    options.where || null,
            model:    m.action_links,
            as:       'links',
            required: true
        };
    };
    fn.inc.stores.order = () => {
        return {
            model: m.orders,
            as:    'order'
        };
    };
    fn.inc.stores.orders = () => {
        return {
            model: m.orders,
            as:    'orders'
        };
    };
    fn.inc.stores.item = () => {
        return {
            model: m.items,
            as:    'item'
        };
    };
    fn.inc.stores.size = (options = {}) => {
        let includes = [fn.inc.stores.item()];
        if (options.details)  includes.push(fn.inc.stores.details());
        if (options.supplier) includes.push(fn.inc.stores.supplier());
        if (options.nsn)      includes.push(fn.inc.stores.nsn());
        return {
            model:   m.sizes,
            include: includes,
            as:      'size'
        };
    };
    fn.inc.stores.sizes = () => {
        return {
            model:   m.sizes,
            include: [fn.inc.users.item()]
        };
    };
    fn.inc.stores.files = (options = {}) => {
        return {
            model: m.files,
            where: options.where || null,
            required: false,
            include: (options.details ? [fn.inc.stores.file_details()] : [])
        };
    };
    fn.inc.stores.file_details = () => {
        return {
            model: m.file_details,
            as: 'details'
        };
    };
    fn.inc.stores.details = (options = {}) => {
        return {
            model: m.details,
            where: options.where || null
        };
    };
    fn.inc.stores.loancard_lines = () => {
        return {
            model: m.loancard_lines,
            as:    'lines'
        };
    };
    fn.inc.stores.loancard = (options = {}) => {
        return {
            model:    m.loancards,
            include:  options.include  || [],
            as:       'loancard',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    fn.inc.stores.demand = () => {
        return {
            model: m.demands,
            include: [
                fn.inc.users.user(),
                fn.inc.stores.supplier()
            ],
            as: 'demand',
        };
    };
    fn.inc.stores.demand_lines = () => {
        return {
            model: m.demand_lines,
            include: [fn.inc.stores.size()],
            as: 'lines',
        };
    };
    fn.inc.stores.issue = () => {
        let include = [];
        include.push(fn.inc.users.user({as: 'user_issue'}));
        include.push(fn.inc.users.user());
        return {
            model:   m.issues,
            include: include,
            as:      'issue'
        };
    };
    fn.inc.stores.issues = () => {
        let include = [];
        include.push(fn.inc.users.user({as: 'user_issue'}));
        include.push(fn.inc.users.user());
        include.push(fn.inc.stores.size());
        return {
            model:   m.issues,
            include: include,
            as:      'issues'
        };
    };
    fn.inc.stores.location = () => {
        return {
            model: m.locations,
            as:    'location'
        };
    };
    fn.inc.stores.stock = () => {
        return {
            model:   m.stocks,
            as:      'stock',
            include: [fn.inc.stores.location()]
        };
    };
    fn.inc.stores.nsn = () => {
        return {
            model: m.nsns,
            as:    'nsn',
            include: [
                fn.inc.stores.nsn_class(),
                fn.inc.stores.nsn_country(),
                fn.inc.stores.nsn_group()
            ]
        };
    };
    fn.inc.stores.nsn_class = () => {
        return {
            model: m.nsn_classes,
            as:    'nsn_class'
        };
    };
    fn.inc.stores.nsn_country = () => {
        return {
            model: m.nsn_countries,
            as:    'nsn_country'
        };
    };
    fn.inc.stores.nsn_group = () => {
        return {
            model: m.nsn_groups,
            as:    'nsn_group'
        };
    };
    fn.inc.stores.account = () => {
        return {
            model:   m.accounts,
            include: [fn.inc.users.user()],
            as:      'account'
        };
    };
    fn.inc.stores.supplier = () => {
        return {
            model: m.suppliers,
            as:    'supplier'
        };
    };
    fn.inc.stores.scrap = () => {
        return {
            model: m.scraps,
            as:    'scrap',
            include: [fn.inc.stores.supplier()]
        };
    };
    fn.inc.stores.scrap_lines = (where = null, required = false) => {
        return {
            model: m.scrap_lines,
            as:    'lines',
            where: where,
            required: required
        };
    };
    fn.inc.stores.address = () => {
        return {
            model: m.addresses,
            as:    'address'
        };
    };
    fn.inc.stores.size_filter = (query) => {
        return {
            model: m.sizes,
            where: {
                ...(query.like && query.like.size1 ? {size1: {[fn.op.substring]: query.like.size1}} : {}),
                ...(query.like && query.like.size2 ? {size2: {[fn.op.substring]: query.like.size2}} : {}),
                ...(query.like && query.like.size3 ? {size3: {[fn.op.substring]: query.like.size3}} : {})
            },
            include: [{
                model: m.items,
                where: (query.like && query.like.item && query.like.item !== '' ? {description: {[fn.op.substring]: query.like.item}} : {})
            }]
        }
    }
    fn.inc.stores.contact = () => {
        return {
            model: m.contacts,
            as:    'contact'
        };
    };
    fn.inc.stores.gender = () => {
        return {
            model: m.genders,
            as:    'gender'
        };
    };
    fn.inc.stores.category = () => {
        return {
            model: m.categories,
            as:    'category'
        };
    };
    fn.inc.stores.categories = (options = {}) => {
        return {
            model:    m.categories,
            required: options.required || false,
            where:    options.where    || null,
            as:       options.as       || 'categories'
        };
    };
    fn.inc.stores.serial = () => {
        return {
            model: m.serials,
            as:    'serial'
        };
    };
};