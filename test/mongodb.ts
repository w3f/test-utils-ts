import mongoose from 'mongoose';
import { TestMongoDB } from '../src/mongodb';

import { should } from 'chai';

should();

const testMongodb = new TestMongoDB();

describe('TestMongodb', () => {
    before(async () => {
        await testMongodb.start();
    });

    after(async () => {
        await testMongodb.stop();
    });

    it('a client should be able to connect to the DB', async () => {
        mongoose.connection.readyState.should.eq(1);
    });

    it('should expose the api endpoint', async () => {
        const endpoint = testMongodb.endpoint();

        endpoint.substr(0, 10).should.eq('mongodb://');
    });
});
