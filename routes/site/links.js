module.exports = (app, fn) => {
    app.get('/get/resource_links', (req, res) => {
        fn.site.links.findAll(req.query)
        .then(links => fn.sendRes('resource_links', res, links, req.query))
        .catch(err => fn.sendError(res, err));
    });
    
    app.get('/get/resource_link', (req, res) => {
        fn.site.links.find(req.query.where)
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.get('/get/resource_link_headings', (req, res) => {
        fn.site.links.headings.findAll(req.query)
        .then(headings => fn.sendRes('resource_link_headings', res, headings, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/resource_link_heading', (req, res) => {
        fn.site.links.headings.find(req.query.where)
        .then(heading => res.send({success: true, result: heading}))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/resource_links',    fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.edit(req.body.resource_link_id, req.body.link)
        .then(result => res.send({success: true, message: 'Link saved'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/resource_link_headings', fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.headings.edit(req.body.resource_link_heading_id, req.body.heading)
        .then(result => res.send({success: true, message: 'Heading saved'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.post('/resource_links',       fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.create(req.body.link)
        .then(link => res.send({success: true, message: 'Link created'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/resource_link_headings', fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.headings.create({heading: req.body.heading})
        .then(link => res.send({success: true, message: 'Heading created'}))
        .catch(err => fn.sendError(res, err));
    });

    app.delete('/resource_links/:id', fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Link deleted'}))
        .catch(err => fn.sendError(res, err));
    });
    app.delete('/resource_link_headings/:id', fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.headings.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Heading deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};