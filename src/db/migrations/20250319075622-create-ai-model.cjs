'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ai_models', {
            ai_model_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            logo_secure_url: {
                type: Sequelize.TEXT,
            },
            logo_public_id: {
                type: Sequelize.TEXT,
            },
            model_generation_type: {
                type: Sequelize.ENUM('text', 'image'),
                allowNull: false,
                defaultValue: 'text',
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ai_models');
    }
};
