module.exports = (fn) => {
    return (req, res, next) => {
        ['where', 'like', 'lt', 'gt', 'order', 'limit', 'offset'].forEach(e => {
            if (req.query[e]){
                try {
                    req.query[e] = JSON.parse(req.query[e]);
                } catch (err) {
                    console.error(`Error parsing query: ${e}`);
                    console.error(`Line: ${req.query[e]}`);
                    console.error(`Error: ${err}`);
                };
            };
        });
        if (req.query.like) {
            Object.keys(req.query.like).forEach(key => {
                if (req.query.like[key]) {
                    if (!req.query.where) req.query.where = {};
                    req.query.where[key] = { [ fn.op.substring ]: req.query.like[ key ] };
                };
            });
        };
        next();
    };
};