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
            },
            logo_secure_url: {
                type: Sequelize.STRING,
            },
            logo_public_id: {
                type: Sequelize.STRING,
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
