import { pool } from './db.js'

try {
    const result = await pool.query(`
        SELECT
            current_database() AS database,
            current_user AS user,
            current_schema() AS schema,
            inet_server_port() AS port
    `)

    console.log('Conexão atual:', result.rows[0])

    const tables = await pool.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_name = 'tasks'
    `)

    console.log('Tabelas encontradas:', tables.rows)
} catch (error) {
    console.error('Erro:', error.message)
} finally {
    await pool.end()
}