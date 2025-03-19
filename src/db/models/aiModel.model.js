// aiModel.model.js
import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js';

class AiModel extends Model { }

AiModel.init(
    {
        ai_model_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Name cannot be empty',
                },
                notEmpty: {
                    msg: 'Name cannot be empty',
                },
            },
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
        },
    },
    {
        sequelize,
        modelName: 'AiModel',
        tableName: 'ai_models',
        timestamps: false,
    }
);

export default AiModel;
