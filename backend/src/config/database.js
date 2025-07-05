const mysql = require('mysql2/promise');
const {appLogger} = require('./logger');

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

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        appLogger.info('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        appLogger.error('Database connection failed:', error);
        return false;
    }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        appLogger.error('Database query error:', { query, params, error: error.message });
        throw error;
    }
};

// Execute transaction
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

// Get connection for complex operations
const getConnection = async () => {
    return await pool.getConnection();
};

// Initialize database connection on startup
testConnection();

module.exports = {
    pool,
    dbConfig,
    executeQuery,
    executeTransaction,
    getConnection,
    testConnection
};
