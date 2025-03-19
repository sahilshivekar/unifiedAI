import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js';
import Chat from './chat.model.js'; // Import Chat model
import AiModel from './aiModel.model.js'; // Import AiModel model

class PromptResponse extends Model { }

PromptResponse.init(
    {
        prompt_response_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        chat_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "chats",
                key: 'chat_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        rank: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Rank cannot be empty',
                },
                notEmpty: {
                    msg: 'Rank cannot be empty',
                },
            }
        },
        prompt_text: {
            type: Sequelize.STRING,
        },
        prompt_file_secure_url: {
            type: Sequelize.STRING,
        },
        prompt_file_public_id: {
            type: Sequelize.STRING,
        },
        response_text: {
            type: Sequelize.STRING,
        },
        response_file_secure_url: {
            type: Sequelize.STRING,
        },
        response_file_public_id: {
            type: Sequelize.STRING,
        },
        ai_model_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: AiModel,
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
    },
    {
        sequelize,
        modelName: 'PromptResponse',
        tableName: 'prompt_responses',
        timestamps: false,
    }
);

AiModel.hasMany(PromptResponse, { foreignKey: 'ai_model_id', sourceKey: 'ai_model_id' });
PromptResponse.belongsTo(AiModel, { foreignKey: 'ai_model_id', targetKey: 'ai_model_id' });


export default PromptResponse;