module.exports = function (m) {
    m.pos_pages.hasMany(
        m.pos_layouts,
        {
            foreignKey: 'page_id',
            targetKey:  'page_id',
            as: 'items'
        }
    );
    
    m.pos_layouts.hasOne(
        m.canteen_items,
        {
            foreignKey: 'item_id',
            sourceKey:  'item_id',
            as: 'item',
            constraints: false
        }
    );
};