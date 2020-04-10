import mariadb from 'mariadb';
import { TestMariaDB } from '../src/mariadb';

import { should } from 'chai';

should();

const testMariaDB = new TestMariaDB();

describe('TestMariaDB', () => {
    before(async () => {
        await testMariaDB.start();
    });

    after(async () => {
        await testMariaDB.stop();
    });

    it('a client should be able to connect to the DB', async () => {
        const endpoint = testMariaDB.endpoint();

        const pool = mariadb.createPool(endpoint);
        const conn = await pool.getConnection();
        await conn.query('SELECT 1');
    });
});
