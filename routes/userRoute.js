const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const {
    authValidationSchema, 
    userCreateValidationSchema, 
    forgotPasswordValidationSchema, 
    resetPasswordValidationSchema, 
    changePasswordValidationSchema,
    userUpdateValidationSchema,
    verifyResetTokenValidationSchema
} = require('../validations/userValidation');
const { validate } = require("express-validation");
const AuthGuard = require('../utils/AuthGuard').guard;
const multer = require("../utils/multerConfig");

router.post('/signup',multer.single('profilePhoto'),validate(userCreateValidationSchema),authController.signUp);
router.post('/login',validate(authValidationSchema),authController.login);
router.post('/forgotPassword',validate(forgotPasswordValidationSchema),authController.forgotPassword);
router.post('/verifyResetToken',validate(verifyResetTokenValidationSchema),authController.verifyResetToken);
router.post("/uploadImage", multer.single('coverImage'), (req, res) => {
  const imageUrl = req.file.filename;
  res.status(200).json({ imageUrl});
});
router.get('/verify/:token',authController.verifyEmail);
router.get('/currentUser',AuthGuard,authController.getCurrentUser);
router.patch('/resetPassword/:resetToken',validate(resetPasswordValidationSchema),authController.resetPassword);
router.patch('/activation/:userId',AuthGuard,authController.activation);
router.patch('/verification/:userId',AuthGuard,authController.verification);
router.route('/').get(AuthGuard,userController.getAllUsers);
router.route('/changePassword/:id').patch(AuthGuard,validate(changePasswordValidationSchema),userController.changePassword);
router.route('/:id').get(userController.getUser)
.patch(AuthGuard,validate(userUpdateValidationSchema),multer.single('profilePhoto'),userController.updateUser)
    .delete(AuthGuard,userController.deleteUser);

module.exports = router;