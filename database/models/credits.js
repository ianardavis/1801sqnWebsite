/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('credits', {
    'credit_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'credit': {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: '0.00',
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
    tableName: 'credits',
    schema: 'canteen'
  });
};
