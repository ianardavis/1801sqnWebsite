/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('resource_links', {
    'resource_link_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'heading': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'href': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'title': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'text': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'createdAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'updatedAt': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'resource_links',
    schema: 'site'
  });
};
