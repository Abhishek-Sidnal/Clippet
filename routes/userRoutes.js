const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/signup', userController.renderSignupForm);
router.post('/signup', userController.registerUser);

router.get('/login', userController.renderLoginForm);
router.post('/login', userController.loginUser);

router.get('/home', userController.getAllUsers);
router.get('/edit/:id', userController.renderEditUserForm);
router.post('/edit/:id', userController.editUser);

router.post('/delete/:id', userController.deleteUser);

module.exports = router;
