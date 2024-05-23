"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = bcrypt.genSaltSync(10);
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "user1@example.com",
          password: bcrypt.hashSync("password123", salt),
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "admin@example.com",
          password: bcrypt.hashSync("admin", salt),
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
