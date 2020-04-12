import { dockerCommand } from 'docker-cli-js';
import mariadb from 'mariadb';

import { delay, notCI } from './util';

const image = 'bitnami/mariadb';
const port = '3306';
const containerName = 'w3f-test-utils-mariadb';
const user = 'root';
const password = 'pass';
const database = 'test';


export class TestMariaDB {
    private _conn: mariadb.Connection;
    private _host = '127.0.0.1';

    endpoint(): string {
        return `mariadb://root:${password}@${this._host}:${port}/${database}`;
    }

    async start(version = '10.3.22-debian-10-r60'): Promise<void> {
        if (notCI()) {
            await dockerCommand(`pull ${image}:${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -e MARIADB_DATABASE=${database} -e MARIADB_ROOT_HOST=% -e MARIADB_ROOT_PASSWORD=${password} -d -p ${port}:${port} ${image}`, { echo: false });
        } else {
            this._host = 'mariadb';
        }
        let connected = false;
        const pool = mariadb.createPool({ host: this._host, user, password, database, acquireTimeout: 3000 });
        while (!connected) {
            await delay(1000);
            try {
                this._conn = await pool.getConnection();
                await this._conn.query('SELECT 1');
                connected = true;
            } catch (e) {
                console.log(`mariaDB not yet connected: ${e}`)
            }
        }
    }

    async stop(): Promise<void> {
        if (this._conn) {
            this._conn.end();
        }
        if (notCI()) {
            await dockerCommand(`rm -f ${containerName}`, { echo: false });
        }
    }
}
