import { dockerCommand } from 'docker-cli-js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { waitReady } from '@polkadot/wasm-crypto';

const rpcImage = 'parity/polkadot';
const containerName = 'watchtower-test-rpc';
const rpcPort = '11000';

export class TestRPC {
    private _endpoint: string;
    private _api: ApiPromise;

    constructor() {
        if (this.notCI()) {
            this._endpoint = `ws://localhost:${rpcPort}`;
        } else {
            this._endpoint = `ws://polkadot:${rpcPort}`
        }
    }

    api(): ApiPromise {
        return this._api;
    }

    endpoint(): string {
        return this._endpoint;
    }

    async start(version = '0.7.28'): Promise<void> {
        if (this.notCI()) {
            await dockerCommand(`pull ${rpcImage}:v${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -d -p ${rpcPort}:${rpcPort} ${rpcImage} --dev --ws-port ${rpcPort} --unsafe-ws-external`, { echo: false });
        }

        const provider = new WsProvider(this._endpoint);
        let connected = false
        while (!connected) {
            try {
                this._api = await ApiPromise.create({ provider });
                await waitReady();

                connected = true;
            } catch (e) {
                console.log(`RPC connection error`);
            }
        }
    }

    async stop(): Promise<void> {
        if (this._api) {
            this._api.disconnect();
        }
        if (this.notCI()) {
            await dockerCommand(`rm -f ${containerName}`, { echo: false });
        }
    }

    private notCI(): boolean {
        return !process.env['GITHUB_ACTIONS'] && !process.env['CI'];
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
