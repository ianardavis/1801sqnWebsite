const fn = {},
      mw = {};
module.exports = (app, m) => {
    var al = require('../../config/allowed.js');
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    require('./adjusts')    (app, al, fn, mw.isLoggedIn, {stock: m.stock, adjusts: m.adjusts});
    require('./demands')    (app, al, fn, mw.isLoggedIn, {demands: m.demands, demands_l: m.demands_l, suppliers: m.suppliers});
    require('./files')      (app, al, fn, mw.isLoggedIn, {files: m.files, suppliers: m.suppliers});
    require('./genders')    (app, al, fn, mw.isLoggedIn, {genders: m.genders});
    require('./issues')     (app, al, fn, mw.isLoggedIn, {issues: m.issues, issues_l: m.issues_l, users: m.users, ranks: m.ranks});
    require('./item_sizes') (app, al, fn, mw.isLoggedIn, {item_sizes: m.item_sizes, items: m.items, suppliers: m.suppliers, sizes: m.sizes, stock: m.stock, nsns: m.nsns});
    require('./items')      (app, al, fn, mw.isLoggedIn, {items: m.items, item_sizes: m.item_sizes, categories: m.categories, groups: m.groups, types: m.types, subtypes: m.subtypes, genders: m.genders});
    require('./itemSearch') (app, fn, mw.isLoggedIn,     {item_sizes: m.item_sizes, items: m.items, sizes: m.sizes, stock: m.stock, nsns: m.nsns, locations: m.locations});
    require('./notes')      (app, al, fn, mw.isLoggedIn, {notes: m.notes, users: m.users, ranks: m.ranks});
    require('./nsns')       (app, al, fn, mw.isLoggedIn, {nsns: m.nsns, item_sizes: m.item_sizes, items: m.items, sizes: m.sizes});
    require('./options')    (app, al, fn, mw.isLoggedIn, {categories: m.categories, groups: m.groups, types: m.types, subtypes: m.subtypes});
    require('./orders')     (app, al, fn, mw.isLoggedIn, {users: m.users, ranks: m.ranks, orders: m.orders, orders_l: m.orders_l, suppliers: m.suppliers, demands: m.demands, demands_l: m.demands_l, receipts: m.receipts, receipts_l: m.receipts_l, issues: m.issues, issues_l: m.issues_l, stock: m.stock, locations: m.locations, item_sizes: m.item_sizes, nsns: m.nsns, sizes: m.sizes, items: m.items});
    require('./permissions')(app, al, fn, mw.isLoggedIn, {users: m.users, ranks: m.ranks, permissions: m.permissions});
    require('./ranks')      (app, al, fn, mw.isLoggedIn, {ranks: m.ranks});
    require('./receipts')   (app, al, fn, mw.isLoggedIn, {suppliers: m.suppliers, receipts: m.receipts, receipts_l: m.receipts_l, stock: m.stock, locations: m.locations, suppliers: m.suppliers});
    require('./requests')   (app, al, fn, mw.isLoggedIn, {permissions: m.permissions, users: m.users, ranks: m.ranks, requests: m.requests, requests_l: m.requests_l, orders: m.orders, issues: m.issues});
    require('./returns')    (app, al, fn, mw.isLoggedIn);
    require('./settings')   (app, al, fn, mw.isLoggedIn, {categories: m.categories, groups: m.groups, types: m.types, sizes: m.sizes});
    require('./sizes')      (app, al, fn, mw.isLoggedIn, {sizes: m.sizes, item_sizes: m.item_sizes});
    require('./statuses')   (app, al, fn, mw.isLoggedIn, {statuses: m.statuses, users: m.users});
    require('./stock')      (app, al, fn, mw.isLoggedIn, {locations: m.locations, stock: m.stock, item_sizes: m.item_sizes, items: m.items, sizes: m.sizes});
    require('./suppliers')  (app, al, fn, mw.isLoggedIn, {suppliers: m.suppliers, files: m.files, inventories: m.inventories, item_sizes: m.item_sizes, items: m.items, sizes: m.sizes});
    require('./users')      (app, al, fn, mw.isLoggedIn, {permissions: m.permissions, statuses: m.statuses, users: m.users, ranks: m.ranks, requests: m.requests, requests_l: m.requests_l, orders: m.orders, orders_l: m.orders_l, issues: m.issues, issues_l: m.issues_l});

    app.get('/stores', mw.isLoggedIn, (req, res) => res.render('stores/index'));
};
