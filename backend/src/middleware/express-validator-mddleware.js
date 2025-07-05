const { validationResult } = require('express-validator');
const { appLogger } = require('../config/logger');

const validarExpressValidator = (req, res, next) => {
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        const mensajes = errores.array().map(error => ({
            campo: error.path || error.param,
            mensaje: error.msg,
            valor: error.value
        }));

        appLogger.warn('Falló validación con express-validator :(', {
            errores: mensajes,
            ip: req.ip,
            url: req.originalUrl,
            metodo: req.method
        });

        return next(new Error('Datos de entrada inválidos', {
            status: 400,
            detalles: mensajes
        }));
    }

    next();
};

module.exports = {
    validarExpressValidator
};
