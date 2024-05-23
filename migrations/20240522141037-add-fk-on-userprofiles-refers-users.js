"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("UserProfiles", "UserId", {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: {
          tableName: "Users",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserProfiles", "UserId");
  },
};
