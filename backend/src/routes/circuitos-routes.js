const express = require('express');
const { param } = require('express-validator');
const CircuitosController = require('../controllers/circuitos-controller');
const { autenticar } = require('../middleware/auth-middleware');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');

const router = express.Router();

// Validaciones para parámetros de circuito
const circuitoValidacion = [
  param('direccion').isLength({ min: 1 }).withMessage('La dirección del circuito es requerida'),
  param('numero').isLength({ min: 1 }).withMessage('El número del circuito es requerido'),
];

// Validaciones para parámetros de mesa
const mesaValidacion = [
  param('electionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
  param('mesaNumber').isLength({ min: 1 }).withMessage('El número de mesa es requerido'),
];

// Validaciones para parámetros de departamento
const departmentoIdValidacion = [
  param('departmentId').isInt({ min: 1 }).withMessage('El ID del departamento debe ser un número entero positivo'),
];

// Validaciones para parámetros de elección
const eleccionIdValidacion = [
  param('electionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
];

// Rutas para obtener información de circuitos
router.get('/totem', CircuitosController.nroCircuitoPorIp);
router.get('/usuario/mesas', autenticar(['presidente', 'secretario', 'vocal']), CircuitosController.getMesasUsuario);
router.get('/', autenticar(['admin']), CircuitosController.getTodosCircuitos);
router.get(
  '/departmento/:departmentId',
  autenticar(['admin']),
  departmentoIdValidacion,
  validarExpressValidator,
  CircuitosController.getCircuitosPorDepartamento
);
router.get(
  '/:direccion/:numero',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  circuitoValidacion,
  validarExpressValidator,
  CircuitosController.getInfoCircuito
);
router.get(
  '/assignado/:electionId',
  autenticar(['votante', 'observado']),
  eleccionIdValidacion,
  validarExpressValidator,
  CircuitosController.getCircuitoAsignadoUsuario
);
// Rutas para obtener información de mesas
router.get(
  '/mesa/:electionId/:mesaNumber/estado',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  mesaValidacion,
  validarExpressValidator,
  CircuitosController.getEstadoMesa
);
router.get(
  '/mesa/:electionId/:mesaNumber',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  mesaValidacion,
  validarExpressValidator,
  CircuitosController.getInfoMesa
);

// Rutas para administrar mesas
router.put(
  '/mesa/:electionId/:mesaNumber/abrir',
  autenticar(['presidente']),
  mesaValidacion,
  validarExpressValidator,
  CircuitosController.abrirMesa
);
router.put(
  '/mesa/:electionId/:mesaNumber/cerrar',
  autenticar(['presidente']),
  mesaValidacion,
  validarExpressValidator,
  CircuitosController.cerrarMesa
);

module.exports = router;
