import { dockerCommand } from 'docker-cli-js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { waitReady } from '@polkadot/wasm-crypto';

const rpcImage = 'parity/polkadot';
const containerName = 'watchtower-test-rpc';
const rpcPort = '11000';

export class TestRPC {
    private _api: ApiPromise;

    api(): ApiPromise {
        return this._api;
    }

    async start(version = '0.7.28'): Promise<void> {
        let wsEndpoint = `ws://localhost:${rpcPort}`;
        if (this.notCI()) {

            await dockerCommand(`pull ${rpcImage}:v${version}`, { echo: false });
            await dockerCommand(`run --name ${containerName} -d -p ${rpcPort}:${rpcPort} ${rpcImage} --dev --ws-port ${rpcPort} --unsafe-ws-external`, { echo: false });
        } else {
            wsEndpoint = `ws://polkadot:${rpcPort}`;
        }
        const provider = new WsProvider(wsEndpoint);
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
