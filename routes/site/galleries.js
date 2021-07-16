module.exports = (app, m, fn) => {
    app.get("/galleries",                        fn.permissions.get('', true),                 (req, res) => res.render("site/galleries/index"));
    app.get("/galleries/:id",                    fn.permissions.get('', true),                 (req, res) => res.render("site/galleries/show"));

    app.get('/get/galleries',                                                                  (req, res) => {
        return m.galleries.findAll({
            where:   req.query,
            include: [fn.inc.users.user()]
        })
        .then(galleries => res.send({success: true, result: galleries}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gallery',                                                                    (req, res) => {
        fn.get(
            'galleries',
            req.query,
            [fn.inc.users.user()]
        )
        .then(gallery => res.send({success: true,  result: gallery}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.get('/get/gallery_images',                                                             (req, res) => {
        return m.gallery_images.findAll({
            where:   req.query,
            include: [fn.inc.users.user()]
        })
        .then(images => res.send({success: true, result: images}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/gallery_image',                                                              (req, res) => {
        fn.get(
            'gallery_images',
            req.query,
            [fn.inc.users.user()]
        )
        .then(image => res.send({success: true,  result: image}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/galleries',        fn.loggedIn(), fn.permissions.check('gallery_add'),          (req, res) => {
        if (!req.body.gallery.name) fn.send_error(res, 'No name')
        else {
            m.galleries.create({
                name: req.body.gallery.name,
                user_id: req.user.user_id
            })
            .then(gallery => res.send({success: true, message: 'Gallery created'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.post('/gallery_images',   fn.loggedIn(), fn.permissions.check('gallery_image_add'),    (req, res) => {
        let actions = [];
        if (Array.isArray(req.files.images)) {
            req.files.images.forEach(e => actions.push(fn.galleries.images.upload(e, req.body.image, req.user.user_id)));
        } else actions.push(fn.galleries.images.upload(req.files.images, req.body.image, req.user.user_id));
        Promise.allSettled(actions)
        .then(results => res.send({success: true, message: 'Image(s) uploaded'}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/gallery_images',    fn.loggedIn(), fn.permissions.check('gallery_image_edit'),   (req, res) => {
        fn.get(
            'gallery_images',
            {image_id: req.body.image_id},
            req.body.image
        )
        .then(image => res.send({success: true, message: 'Image saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/gallery_images', fn.loggedIn(), fn.permissions.check('gallery_image_delete'), (req, res) => {
        fn.get(
            'gallery_images',
            {image_id: req.body.image_id}
        )
        .then(image => {
            let actions = [];
            actions.push(fn.rm(`${process.env.ROOT}/public/res/images/${image.src}`))
            actions.push(image.destroy())
            return Promise.allSettled(actions)
            .then(results => res.send({success: true, message: 'Image deleted'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};