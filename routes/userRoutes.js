const { Router } = require('express');
const { registerUser, loginUser, editUser, deleteUser, getAllUsers } = require('../controllers/userController');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.patch('/edit-user/:id', editUser);
router.delete('/delete-user/:id', deleteUser);
router.get('/all-users', getAllUsers);

module.exports = router;
