import { dockerCommand } from 'docker-cli-js';
import mongoose from 'mongoose';

import { notCI } from './util';

const image = 'mongo';
const port = '27017';
const containerName = 'w3f-test-utils-mongodb';


export class TestMongoDB {
    private _endpoint = this.getEndpoint('localhost');

    endpoint(): string {
        return this._endpoint;
    }

    async start(version = '4.0.17'): Promise<void> {
        if (notCI()) {
            await dockerCommand(`pull ${image}:${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -d -p ${port}:${port} ${image}`, { echo: false });
        } else {
            this._endpoint = this.getEndpoint('mongodb');
        }
        await mongoose.connect(this._endpoint, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    async stop(): Promise<void> {
        await mongoose.connection.close();
        if (notCI()) {
            await dockerCommand(`rm -f ${containerName}`, { echo: false });
        }
    }

    private getEndpoint(host: string): string {
        return `mongodb://${host}:${port}/testdb`;
    }
}
