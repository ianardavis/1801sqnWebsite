/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
    'item_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'site_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'description': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'size_text1': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'size_text2': {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "null"
    },
    'size_text3': {
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
    tableName: 'items',
    schema: 'stores'
  });
};
