'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(
            'verification_codes',
            {
                iverification_code_id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'user_email'
                    },
                    validate: {
                        notEmpty: {
                            msg: 'Email cannot be empty',
                        },
                        isEmail: {
                            msg: 'Must be a valid email address',
                        }
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                verification_code: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: {
                            msg: 'Code cannot be empty'
                        }
                    }
                },
                expiresAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    field: 'expires_at'
                },
            }
        )
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('verification_codes');
    }
};
