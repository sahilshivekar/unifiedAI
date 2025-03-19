import { Sequelize, Model } from 'sequelize';
import sequelize from '../../config/db.connection.js'; // Your sequelize instance
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
        // user_username: {
        //     type: Sequelize.STRING(255),
        //     allowNull: false,
        //     unique: {
        //         msg: 'This username is already in use',
        //     },
        //     validate: {
        //         notNull: {
        //             msg: 'Username cannot be empty',
        //         },
        //         notEmpty: {
        //             msg: 'Username cannot be empty',
        //         },
        //         notContains: {
        //             args: ' ',
        //             msg: 'Username cannot contain spaces',
        //         },
        //         isLowercase(value) {
        //             if (value !== value.toLowerCase()) {
        //                 throw new Error('Username must be in lowercase');
        //             }
        //         },
        //     },
        // },
        user_password: {
            type: Sequelize.STRING(255),
            allowNull: false,
            validate: {
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

User.prototype.isPasswordMatching = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.beforeCreate(async (user) => {
    if (user?.password) {
        user.password = await bcrypt.hash(user.password, Number(process.env.BCRYPT_SALT));
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password') && user?.password) {
        user.password = await bcrypt.hash(user.password, Number(process.env.BCRYPT_SALT));
    }
    if (user.changed('email')) {
        user.email = user.email.toLowerCase();
        user.isVerified = false;
    }
});

User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
            // username: this.username,
            email: this.email,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );
};

export default User