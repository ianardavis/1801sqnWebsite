module.exports = (app, fn) => {
    app.get('/get/resource_links', (req, res) => {
        fn.site.links.get_all(req.query)
        .then(links => fn.send_res('resource_links', res, links, req.query))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/resource_link', (req, res) => {
        fn.site.links.get(req.query.where)
        .then(link => res.send({success: true, result: link}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/resource_link_headings', (req, res) => {
        fn.settings.get_all({where: {name: 'link_heading'}})
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/resource_links',    fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        console.log(req.body);
        fn.site.links.edit(req.body.resource_link_id, req.body.link)
        .then(result => res.send({success: true, message: 'Link saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.post('/resource_links',       fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.create(req.body.link)
        .then(link => res.send({success: true, message: 'Link created'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/resource_links/:id', fn.loggedIn(), fn.permissions.check('site_admin'), (req, res) => {
        fn.site.links.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Link deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};