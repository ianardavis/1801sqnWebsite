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
                    fn.update(
                        layout,
                        {
                            item_id: layout.item_id,
                            colour:  layout.colour
                        }
                    )
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};