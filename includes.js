const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
module.exports = (inc, m) => {
    inc.users = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push(m.ranks);
        };
        return {
            model:   m.users,
            as:      options.as || 'user',
            include: include
        };
    };
    inc.stock = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        else {
            include.push({model: m.locations, required: options.require_locations || false});
            if (options.size) include.push(inc.sizes());
        };
        return {
            model:    m.stock,
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
            model:    m.sizes,
            include:  include,
            where:    options.where    || null,
            required: options.required || false
        };
    };

    inc.nsns = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:    m.nsns,
            include:  include,
            required: options.required || false,
            where:    options.where    || null,
            required: options.required || false
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
            include:  include,
            required: options.required || false,
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.serials = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:    m.serials,
            include:  include,
            required: options.required || false,
            where:    options.where    || null,
            required: options.required || false
        };
    };
    inc.suppliers = (options = {}) => {
        let include = [];
        if (options.include) include = options.include
        return {
            model:    m.suppliers,
            include:  include,
            required: options.required || false,
            where:    options.where    || null,
            required: options.required || false
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
            include:  include,
            as:       options.as       || 'return',
            where:    options.where    || null,
            required: options.required || false
        };
    };
    
};