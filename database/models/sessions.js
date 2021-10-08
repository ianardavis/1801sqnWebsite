/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sessions', {
    'session_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'datetime_end': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'user_id_open': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    'user_id_close': {
      type: DataTypes.UUIDV4,
      allowNull: true,
      comment: "null"
    },
    'status': {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '1',
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
    tableName: 'sessions',
    schema: 'canteen'
  });
};
