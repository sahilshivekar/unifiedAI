import User from '../db/models/user.model.js';
import VerificationCode from '../db/models/verificationCode.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Op } from 'sequelize';
import { sendVerificationCode } from '../utils/email.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

//* generate verfication code for verifying email and forgot password
const generateVerificationCode = (length = 6) => {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += crypto.randomInt(0, 10).toString();
    }
    return code;
};

//* options for setting cookies
const options = {
    // httpOnly: true,
    // secure: true,
    // sameSite: "none"
};

//* generate access and refresh tokens for users at the time of login
// const generateAccessAndRefreshTokens = async (user) => {
//     try {
//         const newAccessToken = await user.generateAccessToken();
//         const newRefreshToken = await user.generateRefreshToken();

//         return { newAccessToken, newRefreshToken };
//     } catch (err) {
//         throw new ApiError(500, "Something went wrong while generating tokens");
//     }
// };

//* register user
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    const createdUser = await User.create({
        user_username: username || null,
        user_email: email ? email.toLowerCase() : null,
        user_password: password || null,
    });

    if (!createdUser) {
        throw new ApiError(500, "Some issue occurred while registering user");
    }

    res.status(201).json(
        new ApiResponse(
            201,
            'User registered successfully',
            createdUser
        )
    );
});

//* login user
const loginUser = asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername) {
        throw new ApiError(400, "Email or Username is needed");
    }

    if (!password) {
        throw new ApiError(400, "Password is needed");
    }

    const user = await User.findOne({
        where: {
            [Op.or]: [
                { user_email: emailOrUsername ? emailOrUsername.toLowerCase() : "" },
                { user_username: emailOrUsername ? emailOrUsername.toLowerCase() : "" }
            ]
        },
    });

    if (!user) {
        throw new ApiError(404, "No user found with entered credentials");
    }

    const isPasswordMatching = await user.isPasswordMatching(password);

    if (!isPasswordMatching) {
        throw new ApiError(400, "Password didn't match");
    }

    const accessToken = await user.generateAccessToken();

    await user.save();

    res.status(200)
        .cookie("unifiedAiAccessToken", accessToken, {
            ...options,
            maxAge: 86400000, //15 days
        })
        .json(
            new ApiResponse(
                200,
                "Login Successful",
                {
                    user: user, accessToken: accessToken
                }
            )
        );
});


//* Change user password
const updateUserPassword = asyncHandler(async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        throw new ApiError(400, "Both password and confirm password are required");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password field do not match");
    }

    const user = await User.findByPk(req.user.user_id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordMatching = await user.isPasswordMatching(password);

    if (isPasswordMatching) {
        throw new ApiError(400, "New password can't be same as old password.");
    }

    user.user_password = password;

    await user.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Password updated successfully",
            null
        )
    );
});

//* Remove user
const removeUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await user.destroy();

    res.status(200)
        .clearCookie("unifiedAiAccessToken")
        .json(
            new ApiResponse(
                200,
                "User account deleted successfully. ",
                null
            )
        );
});

// send verification code to email
const sendVerificationCodeToEmail = asyncHandler(async (req, res) => {
    let { email } = req.body;

    if (!email && !req?.user?.user_email) {
        throw new ApiError(400, "Email is required");
    }

    if (email) {
        email = email.toLowerCase();
    } else {
        email = req?.user?.user_email.toLowerCase();
    }

    const user = await User.findOne({ where: { user_email:email } });

    if (!user) {
        throw new ApiError(400, "User with this email doesn't exists");
    }

    const verificationCode = generateVerificationCode();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const record = await VerificationCode.create({
        user_email:email,
        verification_code: verificationCode,
        expiresAt,
    });

    if (!record) {
        throw new ApiError(500, "Some issue occurred while generating code");
    }

    const emailSent = await sendVerificationCode(email, verificationCode);

    if (!emailSent) {
        throw new ApiError(500, "Error sending verification email");
    }

    setTimeout(
        async () => {
            await VerificationCode.destroy({
                where: {
                    [Op.and]: [{ email: email }, { verificationCode }],
                },
            });
            console.log(`Verification code for ${email} is deleted due to timeout`);
        },
        5 * 60 * 1000
    );

    res.status(200).json(
        new ApiResponse(
            200,
            `Verification code sent on email ${email}`,
            {
                expiresAt,
            }
        )
    );
});


// verify if the user entered the code sent to him on his email
const verifyCode = asyncHandler(async (req, res) => {
    let { email, code } = req.body;
    
    if (!email && !req?.user?.user_email) {
        throw new ApiError(400, "Email is required");
    }

    if (email) {
        email = email.toLowerCase();
    } else {
        email = req?.user?.user_email.toLowerCase();
    }

    if (!code) {
        throw new ApiError(400, "Please enter the code");
    }

    const codeRecord = await VerificationCode.findOne({
        where: {
            [Op.and]: [{ user_email: email.toLowerCase() }, { verification_code: code }],
        },
    });

    if (!codeRecord) {
        throw new ApiError(400, "Invalid verification code");
    }

    const user = await User.findOne({ where: { user_email: email.toLowerCase() } });

    if (!user.is_user_email_verified) {
        user.is_user_email_verified = true;
        await user.save();
    }

    await VerificationCode.destroy({ where: { user_email: email.toLowerCase() } });

    const accessToken = user.generateAccessToken()

    res.status(200)
        .cookie("unifiedAiAccessToken", accessToken, { // in frontend you need to store this only if the code is getting verified if password is forgotten
            ...options,
            maxAge: 86400000, //15 days
        })
        .json(
            new ApiResponse(
                200,
                "Verification successful!",
                {
                    user: user, unifiedAiAccessToken: accessToken //token is sent if accessing this api from modbile app
                }
            )
        );
});

//* logout user
const logout = asyncHandler(async (req, res) => {
    res.status(200)
        .clearCookie('unifiedAiAccessToken')
        .json(
            new ApiResponse(
                200,
                "Logged out successfully",
                null
            )
        );
});

const getUserDetailsById = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            "User details retrieved successfully",
            user
        )
    );
});

export {
    registerUser,
    loginUser,
    updateUserPassword,
    removeUser,
    sendVerificationCodeToEmail,
    verifyCode,
    logout,
    getUserDetailsById,
};