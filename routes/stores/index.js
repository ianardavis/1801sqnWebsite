const   express = require('express'),
        router  = express.Router({mergeParams: true}),
        mw      = require('../../config/middleware'),
        fn      = require('../../db/functions');


//root
router.get('/', mw.isLoggedIn, (req, res) => {
    res.render('stores/index');
});

module.exports = router;