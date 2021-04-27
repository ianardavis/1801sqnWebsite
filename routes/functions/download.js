module.exports = function(fn) {
    fn.download = function (file, req, res) {
        let path = `${process.env.ROOT}/public/res/`;
        res.download(path + file, path + file, err => {
            if (err) {
                console.log(err);
                req.flash('danger', err.message);
            };
        });
    };
};