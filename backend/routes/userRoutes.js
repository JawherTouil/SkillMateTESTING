const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your routes here
router.post("/adduser", userController.add);
router.delete('/deleteuser/:id', userController.remove);
router.post('/updateuser/:id', userController.update);
router.get("/allusers", userController.getAll);
router.get("/getuser/:id", userController.getById);
router.get("/searchuser/:username", userController.searchByUsername);
router.post("/login", userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/verify-code', userController.verifyResetCode);

module.exports = router;