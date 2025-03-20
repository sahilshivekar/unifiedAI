'use strict';

const { query } = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('ai_models', [
            {
                name: 'gemini-1.5-flash',
                logo_secure_url: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.38.0/files/dark/gemini-color.png',
            },
            {
                name: 'gemini-2.0-flash',
                logo_secure_url: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.38.0/files/dark/gemini-color.png',
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('ai_models', null, {});
    }
};
