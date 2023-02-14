module.exports = (app, m, fn) => {
    app.get("/galleries",                        fn.permissions.get('', true),          (req, res) => res.render("site/galleries/index"));
    app.get("/galleries/:id",                    fn.permissions.get('', true),          (req, res) => res.render("site/galleries/show"));

    app.get('/get/galleries',                                                           (req, res) => {
        m.galleries.findAll({
            where:   req.query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(galleries => res.send({success: true, result: galleries}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gallery',                                                             (req, res) => {
        m.galleries.findOne({
            where: req.query.where,
            include: [fn.inc.users.user()]
        })
        .then(gallery => {
            if (gallery) {
                res.send({success: true, result: gallery});
            
            } else {
                res.send({success: false, message: 'Gallery not found'});
            
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/gallery_images',                                                      (req, res) => {
        m.gallery_images.findAll({
            where:   req.query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(req.query)
        })
        .then(images => res.send({success: true, result: images}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gallery_image',                                                       (req, res) => {
        m.gallery_images.findOne({
            where: req.query.where,
            include: [fn.inc.users.user()]
        })
        .then(image => {
            if (image) {
                res.send({success: true,  result: image});

            } else {
                res.send({success: false, message: 'Image not found'});
            
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/galleries',        fn.loggedIn(), fn.permissions.check('gallery_admin'), (req, res) => {
        if (!req.body.gallery.name) {
            fn.send_error(res, 'No name');

        } else {
            m.galleries.create({
                name: req.body.gallery.name,
                user_id: req.user.user_id
            })
            .then(gallery => res.send({success: true, message: 'Gallery created'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.post('/gallery_images',   fn.loggedIn(), fn.permissions.check('gallery_admin'), (req, res) => {
        let actions = [];
        if (Array.isArray(req.files.images)) {
            req.files.images.forEach(e => actions.push(fn.galleries.images.upload(e, req.body.image, req.user.user_id)));

        } else {
            actions.push(fn.galleries.images.upload(req.files.images, req.body.image, req.user.user_id));
        
        };
        Promise.allSettled(actions)
        .then(results => res.send({success: true, message: 'Image(s) uploaded'}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/gallery_images',    fn.loggedIn(), fn.permissions.check('gallery_admin'), (req, res) => {
        m.gallery_images.findOne({
            where: {image_id: req.body.image_id}
        })
        .then(image => res.send({success: true, message: 'Image saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/gallery_images', fn.loggedIn(), fn.permissions.check('gallery_admin'), (req, res) => {
        m.gallery_images.findOne({where: {image_id: req.body.image_id}})
        .then(image => {
            if (image) {
                let actions = [];
                const path = fn.public_file('images', image.src);
                actions.push(fn.rm(path))
                actions.push(image.destroy())
                Promise.allSettled(actions)
                .then(results => res.send({success: true, message: 'Image deleted'}))
                .catch(err => fn.send_error(res, err));
                
            } else {
                res.send({success: false, message: 'Image not found'});
            
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};