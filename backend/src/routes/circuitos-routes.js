const express = require('express');
const { param } = require('express-validator');
const CircuitosController = require('../controllers/circuitos-controller');
const { autenticar } = require('../middleware/auth-middleware');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');

const router = express.Router();

const circuitoValidacion = [
  param('direccion').isLength({ min: 1 }).withMessage('La dirección del circuito es requerida'),
  param('numero').isLength({ min: 1 }).withMessage('El número del circuito es requerido'),
];

const mesaValidacion = [
  param('electionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
  param('mesaNumber').isLength({ min: 1 }).withMessage('El número de mesa es requerido'),
];

const departmentoIdValidacion = [
  param('departmentId').isInt({ min: 1 }).withMessage('El ID del departamento debe ser un número entero positivo')
];

const eleccionIdValidacion = [
  param('electionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo')
];

router.get('/totem', CircuitosController.nroCircuitoPorIp);
router.get('/', autenticar(['admin']), CircuitosController.getTodosCircuitos);
router.get('/departmento/:departmentId', autenticar(['admin']), departmentoIdValidacion, validarExpressValidator, CircuitosController.getCircuitosPorDepartamento);
router.get('/:direccion/:numero', autenticar(['admin', 'presidente', 'secretario', 'vocal']), circuitoValidacion, validarExpressValidator, CircuitosController.getInfoCircuito);
router.get('/assignado/:electionId', autenticar(['votante', 'observado']), eleccionIdValidacion, validarExpressValidator, CircuitosController.getCircuitoAsignadoUsuario);
router.get('/mesa/:electionId/:mesaNumber', autenticar(['admin', 'presidente', 'secretario', 'vocal']), mesaValidacion, validarExpressValidator, CircuitosController.getInfoMesa);
router.put('/mesa/:electionId/:mesaNumber/cerrar', autenticar(['presidente']), mesaValidacion, validarExpressValidator, CircuitosController.cerrarMesa);

module.exports = router;
