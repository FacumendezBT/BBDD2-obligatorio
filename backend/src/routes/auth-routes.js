const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth-controller');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');

const router = express.Router();

const validacionLogin = [
  body('credencial').isLength({ min: 6 }).withMessage('Credencial es requerida'),
  body('password').optional().isLength({ min: 1 }).withMessage('Contraseña es requerida'),
];

router.post('/login', validacionLogin, validarExpressValidator, AuthController.login);
router.post('/logout', AuthController.logout);

module.exports = router;
