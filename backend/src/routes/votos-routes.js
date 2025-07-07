const express = require('express');
const { body, param } = require('express-validator');
const VotosController = require('../controllers/votos-controller');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');
const { autenticar } = require('../middleware/auth-middleware');

const router = express.Router();

const validacionEnviarVoto = [
    body('ciudadano_credencial')
        .notEmpty()
        .withMessage('Credencial del ciudadano es requerida'),
    body('eleccion_id')
        .isInt({ min: 1 })
        .withMessage('ID de elección debe ser un número entero válido'),
    body('circuito_direccion')
        .notEmpty()
        .withMessage('Dirección del circuito es requerida'),
    body('circuito_numero')
        .notEmpty()
        .withMessage('Número del circuito es requerido'),
    body('mesa_numero')
        .notEmpty()
        .withMessage('Número de mesa es requerido'),
    body('papeletas')
        .optional()
        .isArray()
        .withMessage('Papeletas debe ser un array'),
    body('tipo')
        .optional()
        .isIn(['Normal', 'Observado', 'Anulado', 'Observado Anulado', 'Blanco'])
        .withMessage('Tipo de voto inválido')
];

const validacionValidarVoto = [
    body('ciudadano_credencial')
        .notEmpty()
        .withMessage('Credencial del ciudadano es requerida'),
    body('eleccion_id')
        .isInt({ min: 1 })
        .withMessage('ID de elección debe ser un número entero válido'),
    body('circuito_direccion')
        .notEmpty()
        .withMessage('Dirección del circuito es requerida'),
    body('circuito_numero')
        .notEmpty()
        .withMessage('Número del circuito es requerido')
];

const validacionEstadoVotacion = [
    param('idEleccion')
        .isInt({ min: 1 })
        .withMessage('ID de elección debe ser un número entero válido')
];

const validacionAprobarVoto = [
    param('idVoto')
        .isInt({ min: 1 })
        .withMessage('ID de voto debe ser un número entero válido'),
    body('credencial_integrante')
        .notEmpty()
        .withMessage('Credencial del integrante de mesa es requerida')
];

const validacionVotosPorCircuito = [
    param('direccionCircuito')
        .notEmpty()
        .withMessage('Dirección del circuito es requerida'),
    param('numeroCircuito')
        .notEmpty()
        .withMessage('Número del circuito es requerido')
];

router.post('/enviar', autenticar(['votante', 'observado']), validacionEnviarVoto, validarExpressValidator, VotosController.enviarVoto);

router.post('/validar', autenticar(['admin']), validacionValidarVoto, validarExpressValidator, VotosController.validarVoto);

router.get('/estado/:idEleccion', autenticar(['admin', 'presidente', 'secretario', 'vocal']), validacionEstadoVotacion, validarExpressValidator, VotosController.obtenerEstadoVotacion);

router.put('/aprobar/:idVoto', autenticar(['presidente']), validacionAprobarVoto, validarExpressValidator, VotosController.aprobarVoto);

router.get('/circuito/:direccionCircuito/:numeroCircuito', autenticar(['admin', 'presidente', 'secretario', 'vocal']), validacionVotosPorCircuito, validarExpressValidator, VotosController.obtenerVotosPorCircuito);

module.exports = router;
