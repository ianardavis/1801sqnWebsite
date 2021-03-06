/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('serials', {
    'serial_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'serial': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'size_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'location_id': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'issue_id': {
      type: DataTypes.UUIDV4,
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
    tableName: 'serials',
    schema: 'stores'
  });
};
