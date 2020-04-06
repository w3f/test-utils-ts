import { dockerCommand } from 'docker-cli-js';
import mongoose from 'mongoose';

const mongodbImage = 'mongo';
const mongodbPort = '27017';
const containerName = 'watchtower-test-mongodb';


export class TestDB {
    async start(version = '4.0.17'): Promise<void> {
        let host = 'localhost';
        if (this.notCI()) {
            await dockerCommand(`pull ${mongodbImage}:${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -d -p ${mongodbPort}:${mongodbPort} ${mongodbImage}`, { echo: false });
        } else {
            host = 'mongodb';
        }
        await mongoose.connect(`mongodb://${host}:${mongodbPort}/watchtower`, {
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
}
