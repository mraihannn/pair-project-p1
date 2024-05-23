"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Transactions",
      [
        {
          amount: 100,
          date: new Date(),
          UserId: 1, // Sesuaikan dengan ID user yang di-generate oleh seeder Users
          CategoryId: 1, // Sesuaikan dengan ID category yang di-generate oleh seeder Categories
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          amount: 1000,
          date: new Date(),
          UserId: 1, // Sesuaikan dengan ID user yang di-generate oleh seeder Users
          CategoryId: 2, // Sesuaikan dengan ID category yang di-generate oleh seeder Categories
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Transactions", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
