"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Categories",
      [
        {
          name: "Groceries",
          type: "Expense",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Salary",
          type: "Income",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Categories", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
