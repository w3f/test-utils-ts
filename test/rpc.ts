import { TestRPC } from '../src/rpc';

import { should } from 'chai';

should();

const testRPC = new TestRPC();
const polkadotVersion = '0.7.28';

describe('TestRPC', () => {
    before(async () => {
        await testRPC.start(polkadotVersion);
    });

    after(async () => {
        await testRPC.stop();
    });

    it('an api client should be able to connect to the node', async () => {
        const rpcApi = testRPC.api();

        const [chain, nodeName] = await Promise.all([
            rpcApi.rpc.system.chain(),
            rpcApi.rpc.system.name()
        ]);

        chain.should.eq('Development');
        nodeName.should.eq('parity-polkadot');
    });
});
