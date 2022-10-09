module.exports = function (m, fn) {
    fn.galleries = {images: {}};
    fn.galleries.images.upload = function (image, details, user_id) {
        return new Promise((resolve, reject) => {
            const path = fn.public_file('images', image.filename);
            fn.fs.copy_file(
                image.file,
                path
            )
            .then(result => {
                m.gallery_images.create({
                    src:         image.filename,
                    title:       details.title,
                    description: details.description,
                    user_id:     user_id,
                    gallery_id:  details.gallery_id
                })
                .then(gallery_image => {
                    fn.fs.rmdir(`${process.env.ROOT}/public/uploads/${image.uuid}`)
                    .then(result => resolve(true))
                    .catch(err => resolve(false));
                })
                .catch(err => reject(err));
            })
            .catch(err => fn.send_error(res, err));
        });
    };
};