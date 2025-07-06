const express = require('express');
const { body, param } = require('express-validator');
const EleccionController = require('../controllers/eleccion-controller');
const { autenticar } = require('../middleware/auth-middleware');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');

const router = express.Router();

const idEleccionValidacion = [
    param('electionId')
        .isInt({ min: 1 })
        .withMessage('El ID de la elección debe ser un número entero positivo')
];

const validacionCrearEleccion = [
    body('nombre')
        .isLength({ min: 1, max: 255 })
        .withMessage('El nombre de la elección es requerido y debe tener menos de 255 caracteres'),
    body('tipo')
        .isIn(['Presidencial', 'Ballotage', 'Referéndum', 'Plebiscito'])
        .withMessage('El tipo de elección debe ser uno de: Presidencial, Ballotage, Referéndum, Plebiscito'),
    body('fecha_hora_inicio')
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida ISO 8601'),
    body('fecha_hora_fin')
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida ISO 8601')
];

router.get('/', EleccionController.getTotalElecciones);
router.get('/activas', EleccionController.getEleccionesActivas);
router.get('/proximas', EleccionController.getEleccionesFuturas);
router.get('/pasadas', EleccionController.getEleccionesPasadas);

router.get('/:electionId', autenticar(['admin', 'presidente', 'secretario', 'vocal', 'ciudadano']), idEleccionValidacion, validarExpressValidator, EleccionController.getEleccionPorId);
router.get('/:electionId/estado', autenticar(['admin', 'presidente', 'secretario', 'vocal', 'ciudadano']), idEleccionValidacion, validarExpressValidator, EleccionController.checkEstadoEleccion);
router.get('/:electionId/listas', autenticar(['admin', 'presidente', 'secretario', 'vocal', 'ciudadano']), idEleccionValidacion, validarExpressValidator, EleccionController.getListasEleccion);
router.get('/:electionId/estadisticas', autenticar(['admin', 'presidente', 'secretario', 'vocal']), idEleccionValidacion, validarExpressValidator, EleccionController.getStatsEleccion);

router.post('/', autenticar(['admin']), validacionCrearEleccion, validarExpressValidator, EleccionController.crearEleccion);

module.exports = router;
