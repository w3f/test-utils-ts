import { dockerCommand } from 'docker-cli-js';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { notCI } from './util';

const image = 'parity/polkadot';
const containerName = 'w3f-test-utils-polkadot-rpc';
const port = '11000';


export class TestPolkadotRPC {
    private _endpoint: string;
    private _api: ApiPromise;

    constructor() {
        if (notCI()) {
            this._endpoint = `ws://localhost:${port}`;
        } else {
            this._endpoint = `ws://polkadot:${port}`
        }
    }

    api(): ApiPromise {
        return this._api;
    }

    endpoint(): string {
        return this._endpoint;
    }

    async start(version = 'v1.1.0'): Promise<void> {  
        if (notCI()) {
            await dockerCommand(`pull --platform linux/amd64 ${image}:${version}`, { echo: false });
            await dockerCommand(`run --platform linux/amd64 --name ${containerName} -d -p ${port}:${port} ${image}:${version} --chain=kusama-dev --alice --rpc-port 11000 --rpc-external --rpc-methods=Unsafe --rpc-cors=all`, { echo: false });
        }

        const provider = new WsProvider(this._endpoint);
        let connected = false
        while (!connected) {
            try {
                this._api = await ApiPromise.create({ provider });

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
        if (notCI()) {
            await dockerCommand(`rm -f ${containerName}`, { echo: false });
        }
    }
}
