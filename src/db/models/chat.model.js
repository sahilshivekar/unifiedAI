import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js';
import User from './user.model.js';
import PromptResponse from './promptResponse.model.js';

class Chat extends Model { }

Chat.init(
    {
        chat_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        created_date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },
    {
        sequelize,
        modelName: 'Chat',
        tableName: 'chats',
        timestamps: false,
    }
);

Chat.hasMany(PromptResponse, { foreignKey: 'chat_id', sourceKey: 'chat_id' });
PromptResponse.belongsTo(Chat, { foreignKey: 'chat_id', targetKey: 'chat_id' });
export default Chat;
