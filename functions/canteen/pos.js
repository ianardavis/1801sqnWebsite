module.exports = function (m, fn) {
    fn.pos_layouts = {};
    fn.pos_layouts.edit = function (layout) {
        return new Promise((resolve, reject) => {
            m.pos_layouts.findOrCreate({
                where: {
                    page_id: layout.page_id,
                    button:  layout.button
                },
                defaults: {
                    item_id: layout.item_id,
                    colour:  layout.colour
                }
            })
            .then(([layout, created]) => {
                if (created) resolve(true);
                else {
                    layout.update({
                        item_id: layout.item_id,
                        colour:  layout.colour
                    })
                    .then(result => {
                        if (result) resolve(true)
                        else reject(new Error('Layout not updated'));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};