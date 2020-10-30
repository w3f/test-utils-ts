#!/bin/bash
set -e

echo patching...
sed -i "/parity\/polkadot/c\      - image: parity\/polkadot:$latest_upstream " .circleci/config.yml
sed -i "/const polkadotVersion/c\const polkadotVersion = '$latest_upstream'; " test/polkadotRpc.ts
sed -i "/async start(version /c\    async start(version = '$latest_upstream'): Promise<void> {  " src/polkadotRpc.ts
