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
            },
            {
                name: 'cohere-command-a-03-2025',
                logo_secure_url: 'https://bpando.org/wp-content/uploads/00-AI-Branding-NLP-Cohere-Logo-Logotype-Pentagram-London-Office-Jody-Hudson-Powell-Luke-Powell-BPO-Review-2048x1365.jpg.webp'
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('ai_models', null, {});
    }
};
