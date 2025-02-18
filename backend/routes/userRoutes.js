const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Basic CRUD routes
router.post('/adduser', userController.add);
router.get('/allusers', userController.getAll);
router.get('/getuser/:id', userController.getById);
router.put('/updateuser/:id', userController.update);
router.delete('/deleteuser/:id', userController.remove);

// Authentication routes
router.post('/login', userController.login);

// Account deactivation and reactivation routes
router.post('/deactivate', userController.deactivate);
router.post('/reactivate/send-code', userController.reactivateWithPhone);
router.post('/reactivate/verify', userController.verifyAndReactivate);

module.exports = router;