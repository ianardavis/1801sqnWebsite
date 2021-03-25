/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notes', {
    'note_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      defaultValue: sequelize.fn('stores.uuid_generate_v1'),
      comment: "null",
      primaryKey: true
    },
    'id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
    '_table': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'note': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "null"
    },
    'system': {
      type: DataTypes.BOOLEAN,
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
    },
    'user_id': {
      type: DataTypes.UUIDV4,
      allowNull: false,
      comment: "null"
    },
  }, {
    tableName: 'notes',
    schema: 'core'
  });
};
