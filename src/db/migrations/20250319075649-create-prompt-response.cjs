'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('prompt_responses', {
            prompt_response_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chat_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'chats',
                    key: 'chat_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            rank: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            prompt_text: {
                type: Sequelize.TEXT,
            },
            prompt_file_secure_url: {
                type: Sequelize.TEXT,
            },
            prompt_file_public_id: {
                type: Sequelize.TEXT,
            },
            response_text: {
                type: Sequelize.TEXT,
            },
            response_file_secure_url: {
                type: Sequelize.TEXT,
            },
            response_file_public_id: {
                type: Sequelize.TEXT,
            },
            ai_model_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'ai_models',
                    key: 'ai_model_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            is_combined: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            is_best_pick: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('prompt_responses');
    }
};
