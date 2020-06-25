import { TestPolkadotRPC } from '../src/polkadotRpc';

import { should } from 'chai';

should();


const testPolkadotRPC = new TestPolkadotRPC();
const polkadotVersion = 'v0.8.12'; 

describe('TestPolkadotRPC', () => {
    before(async () => {
        await testPolkadotRPC.start(polkadotVersion);
    });

    after(async () => {
        await testPolkadotRPC.stop();
    });

    it('should initialize an API client connected to the node', async () => {
        const rpcApi = testPolkadotRPC.api();

        const [chain, nodeName] = await Promise.all([
            rpcApi.rpc.system.chain(),
            rpcApi.rpc.system.name()
        ]);

        chain.should.eq('Development');
        nodeName.should.eq('Parity Polkadot');
    });

    it('should expose the api endpoint', async () => {
        const endpoint = testPolkadotRPC.endpoint();

        endpoint.substr(0, 5).should.eq('ws://');
    });
});
