import * as mysql from 'mysql';


let pool: mysql.Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME
});

export function _query(sql: string, values: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        pool.getConnection((err: mysql.MysqlError, connection: mysql.PoolConnection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release();
                })
            }
        })
    })
}
