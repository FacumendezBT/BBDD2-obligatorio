const express = require('express');
const { param } = require('express-validator');
const ReportesController = require('../controllers/reportes-controller');
const { autenticar } = require('../middleware/auth-middleware');
const { validarExpressValidator } = require('../middleware/express-validator-mddleware');

const router = express.Router();

// Validaciones para parámetros de circuito
const circuitoValidacion = [
  param('direccion').isLength({ min: 1 }).withMessage('La dirección del circuito es requerida'),
  param('numero').isLength({ min: 1 }).withMessage('El número del circuito es requerido'),
  param('eleccionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
];

// Validaciones para parámetros de departamento
const departamentoValidacion = [
  param('departamentoId').isInt({ min: 1 }).withMessage('El ID del departamento debe ser un número entero positivo'),
  param('eleccionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
];

// Validaciones para parámetros de elección
const eleccionValidacion = [
  param('eleccionId').isInt({ min: 1 }).withMessage('El ID de la elección debe ser un número entero positivo'),
];

// Rutas para reportes de circuito específico
router.get(
  '/circuito/:direccion/:numero/:eleccionId/por-lista',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  circuitoValidacion,
  validarExpressValidator,
  ReportesController.getResultadosPorListaEnCircuito
);

router.get(
  '/circuito/:direccion/:numero/:eleccionId/por-partido',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  circuitoValidacion,
  validarExpressValidator,
  ReportesController.getResultadosAgregadosPorPartidoEnCircuito
);

router.get(
  '/circuito/:direccion/:numero/:eleccionId/por-candidato',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  circuitoValidacion,
  validarExpressValidator,
  ReportesController.getResultadosPorCandidatoEnCircuito
);

// Rutas para reportes de departamento
router.get(
  '/departamento/:departamentoId/:eleccionId/por-partido',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  departamentoValidacion,
  validarExpressValidator,
  ReportesController.getResultadosPorPartidoEnDepartamento
);

router.get(
  '/departamento/:departamentoId/:eleccionId/por-candidato',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  departamentoValidacion,
  validarExpressValidator,
  ReportesController.getResultadosPorCandidatoEnDepartamento
);

// Ruta para candidatos ganadores por departamento
router.get(
  '/eleccion/:eleccionId/ganadores-departamento',
  autenticar(['admin', 'presidente', 'secretario', 'vocal']),
  eleccionValidacion,
  validarExpressValidator,
  ReportesController.getCandidatosGanadoresPorDepartamento
);

module.exports = router;
