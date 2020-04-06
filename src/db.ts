import { dockerCommand } from 'docker-cli-js';
import mongoose from 'mongoose';

const mongodbImage = 'mongo';
const mongodbPort = '27017';
const containerName = 'testdb-mongodb';


export class TestDB {
    private _endpoint = this.getEndpoint('localhost');

    endpoint(): string {
        return this._endpoint;
    }

    async start(version = '4.0.17'): Promise<void> {
        if (this.notCI()) {
            await dockerCommand(`pull ${mongodbImage}:${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -d -p ${mongodbPort}:${mongodbPort} ${mongodbImage}`, { echo: false });
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
        if (this.notCI()) {
            await dockerCommand(`rm -f ${containerName}`, { echo: false });
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private notCI(): boolean {
        return !process.env['GITHUB_ACTIONS'] && !process.env['CI'];
    }

    private getEndpoint(host: string): string {
        return `mongodb://${host}:${mongodbPort}/testdb`;
    }
}
