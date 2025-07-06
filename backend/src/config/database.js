const mysql = require('mysql2/promise');
const { appLogger } = require('./logger');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ObligatorioBD2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const testConnection = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            const connection = await pool.getConnection();
            appLogger.info('✅ Conexión a la base de datos exitosa');
            connection.release();
            return true;
        } catch (error) {
            appLogger.error(`❌ Fallo al conectar a la base de datos. Reintentos restantes: ${retries - 1}`);
            retries--;
            if (retries === 0) {
                appLogger.error('⛔ No se pudo conectar a la base de datos después de varios intentos:', error);
                process.exit(1); // corta la app si no puede conectar
            }
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};

// Llamar con retry al arrancar
testConnection();

const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        appLogger.error('Database query error:', { query, params, error: error.message });
        throw error;
    }
};

const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        appLogger.error('Transaction error:', error);
        throw error;
    } finally {
        connection.release();
    }
};

const getConnection = async () => {
    return await pool.getConnection();
};

module.exports = {
    pool,
    dbConfig,
    executeQuery,
    executeTransaction,
    getConnection,
    testConnection
};
