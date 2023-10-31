module.exports = function (m) {
    m.resource_link_headings.hasMany(
        m.resource_links, 
        {
            foreignKey: 'resource_link_heading_id',
            sourceKey:  'resource_link_heading_id',
            as: 'links'
        }
    );

    m.resource_links.belongsTo(
        m.resource_link_headings,
        {
            foreignKey: 'resource_link_heading_id',
            targetKey:  'resource_link_heading_id',
            as: 'heading'
        }
    );
};