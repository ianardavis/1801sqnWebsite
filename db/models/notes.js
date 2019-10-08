/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notes', {
    'note_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null"
    },
    '_link_table': {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: "null"
    },
    '_link_value': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    '_note': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    '_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    '_system': {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    },
    'user_id': {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'notes'
  });
};
