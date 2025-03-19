import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js'; // Your sequelize instance
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Chat from './chat.model.js';
class User extends Model { }

User.init(
    {
        user_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: {
                msg: 'This email is already in use',
            },
            validate: {
                notNull: {
                    msg: 'Email cannot be empty',
                },
                notEmpty: {
                    msg: 'Email cannot be empty',
                },
                isEmail: {
                    msg: 'Enter a valid email address',
                },
            },
        },
        user_username: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: {
                msg: 'This username is already in use',
            },
            validate: {
                notNull: {
                    msg: 'Username cannot be empty',
                },
                notEmpty: {
                    msg: 'Username cannot be empty',
                },
                notContains: {
                    args: ' ',
                    msg: 'Username cannot contain spaces',
                },
                isLowercase(value) {
                    if (value !== value.toLowerCase()) {
                        throw new Error('Username must be in lowercase');
                    }
                },
                len: {
                    args: [8, 255], // Minimum 8 characters, maximum 255 characters
                    msg: 'Username must be at least 8 characters long',
                },
            },
        },
        user_password: {
            type: Sequelize.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Password cannot be empty',
                },
                notEmpty: {
                    msg: 'Password cannot be empty',
                },
                isStrongPassword(value) {
                    if (!/[A-Z]/.test(value)) {
                        throw new Error('Password must contain at least one uppercase letter');
                    }
                    if (!/\d/.test(value)) {
                        throw new Error('Password must contain at least one number');
                    }
                    if (!/[^\w]/.test(value)) {
                        throw new Error('Password must contain at least one special character');
                    }
                    if (/\s/.test(value)) {
                        throw new Error('Password cannot contain spaces');
                    }
                    if (value.length < 8) {
                        throw new Error('Password must be at least 8 characters long');
                    }
                },
            },
        },
        is_user_email_verified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'created_at',
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: 'updated_at',
        },
    },
    {
        sequelize,
        timestamps: true,
        modelName: 'User',
        tableName: 'users',
    }
);


User.hasMany(Chat, { foreignKey: 'user_id', sourceKey: 'user_id' });
Chat.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });


User.prototype.isPasswordMatching = async function (password) {
    return await bcrypt.compare(password, this.user_password);
};

User.beforeCreate(async (user) => {
    if (user?.user_password) {
        user.user_password = await bcrypt.hash(user.user_password, Number(process.env.BCRYPT_SALT));
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('user_password') && user?.user_password) {
        user.user_password = await bcrypt.hash(user.user_password, Number(process.env.BCRYPT_SALT));
    }
    if (user.changed('user_email')) {
        user.user_email = user.user_email.toLowerCase();
        user.isVerified = false;
    }
});

User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.user_id,
            email: this.user_email,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );
};

export default User