module.exports = {
    send: (err, res) => {
        let message = '';
        if (typeof(err) === 'string') message = err
        else message = err.message;
        console.log(err);
        res.send({result: false, error: message});
    },
    redirect: (err, req, res) => {
        console.log(err);
        req.flash('danger', err.message);
        res.redirect('/');
    }
};