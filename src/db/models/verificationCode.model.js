// verificationCode.model.js
import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js'; // Your sequelize instance
import User from './user.model.js'; // Import User model for the foreign key

class VerificationCode extends Model {}

VerificationCode.init(
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
                key: 'user_email',
            },
            validate: {
                notEmpty: {
                    msg: 'Email cannot be empty',
                },
                isEmail: {
                    msg: 'Must be a valid email address',
                },
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        verification_code: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Code cannot be empty',
                },
            },
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'expires_at',
        },
    },
    {
        sequelize,
        modelName: 'VerificationCode',
        tableName: 'verification_codes',
        timestamps: false, // Assuming no timestamps in your table
    }
);

export default VerificationCode;