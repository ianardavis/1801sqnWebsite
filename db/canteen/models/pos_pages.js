/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('pos_pages', {
      'page_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        primaryKey: true,
        comment: "null",
        autoIncrement: true
      },
      '_title': {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: "null"
      },
      'createdAt': {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "null"
      },
      'updatedAt': {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "null"
      }
    }, {
      tableName: 'pos_pages',
      schema: 'canteen'
    });
  };
  