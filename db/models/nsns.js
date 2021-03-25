/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nsns', {
    'nsn_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'size_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'nsn_group_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'nsn_class_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'nsn_country_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'item_number': {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'nsns',
    schema: 'stores'
  });
};
