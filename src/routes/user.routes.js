import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Assuming you have a verifyJWT middleware for users

const router = Router();

import {
    registerUser,
    loginUser,
    updateUserPassword,
    removeUser,
    sendVerificationCodeToEmail,
    verifyCode,
    logout,
    getUserDetailsById
} from '../controllers/user.controller.js';




// Register user
router.route('/register').post(registerUser);

// Login user
router.route('/login').post(loginUser);

// Send code to email (for forgot password option at the time of login)
router.route("/forgot-password").post(sendVerificationCodeToEmail);

// Verify the email verification code
router.route("/verify-code").post(verifyCode);

//! Secured routes
// Send user his details (no need to send any thing it will get the user id from the token)
router.route('/user-details').get(verifyJWT, getUserDetailsById);

// Send code to email (for email verification and to reset the password if the password is forgotten but the user is logged in)
router.route("/email-verification").get(verifyJWT, sendVerificationCodeToEmail);

// Update current user password
router.route('/update-password').put(verifyJWT, updateUserPassword);

// Delete a user
router.route('/remove-user').delete(verifyJWT, removeUser);

// Logout user
router.route("/logout").post(verifyJWT, logout);

export default router;