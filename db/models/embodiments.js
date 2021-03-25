/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('embodiments', {
    'embodiment_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'size_id_parent': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'size_id_child': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'qty': {
      type: DataTypes.INTEGER,
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
    tableName: 'embodiments',
    schema: 'stores'
  });
};
