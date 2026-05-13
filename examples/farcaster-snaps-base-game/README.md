# Farcaster Snaps + Base Game Integration Example

This example demonstrates how to integrate a Base L2 on-chain game (e.g. [Base Invaders](https://github.com/schoolkamsergj)) with **Farcaster Snaps** — interactive UI elements rendered directly inside Farcaster casts.

## What are Farcaster Snaps?

Snaps are a new Farcaster primitive that allows builders to embed interactive components (buttons, sliders, polls, games, transactions, etc.) directly inside casts.

→ [Farcaster Snaps Docs](https://docs.farcaster.xyz/snap)

## Use case: Launch a Base game from a cast

With this pattern you can:
- Show a **"Play Now"** button inside a Farcaster cast
- Identify the Farcaster user on first load (via Snap identity resolution)
- Trigger a **Base L2 transaction** (e.g. start game session, mint score NFT) directly from the cast
- Display real-time game results back in the cast

## How it works

```
Farcaster Cast (Snap)
  └── Button: "Play Base Invaders"
        └── Opens Base MiniKit mini-app (Next.js)
              └── Base MiniKit authenticates Farcaster user
              └── Smart contract on Base mainnet records score
              └── Result returned to Snap UI inside cast
```

## Integration steps

### 1. Create a Snap endpoint

Add a new API route in your Next.js app:

```ts
// app/api/snap/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { untrustedData } = body;

  // untrustedData.fid = Farcaster user ID (if user interacted before)
  const fid = untrustedData?.fid;

  return NextResponse.json({
    type: 'snap',
    snap: {
      version: '1',
      components: [
        {
          type: 'button',
          label: fid ? `Play as FID ${fid}` : 'Play Base Invaders',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_APP_URL}?fid=${fid ?? ''}`,
        },
      ],
    },
  });
}
```

### 2. Register your Snap in the cast metadata

When casting from your app, include the Snap URL in the cast embed:

```ts
import { sdk } from '@farcaster/miniapp-sdk';

await sdk.actions.composeCast({
  text: '🚀 Play Base Invaders on Base mainnet!',
  embeds: [`${process.env.NEXT_PUBLIC_APP_URL}/api/snap`],
});
```

### 3. Handle Base transaction from Snap context

Inside your Base MiniKit mini-app, detect the Farcaster identity and trigger the on-chain action:

```ts
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount, useWriteContract } from 'wagmi';

export function GameLauncher({ fid }: { fid?: string }) {
  const { isInMiniApp } = useMiniKit();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const startGame = () => {
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: 'startSession',
      args: [BigInt(fid ?? 0)],
    });
  };

  return (
    <button onClick={startGame}>
      {isInMiniApp ? 'Start via Farcaster' : 'Start Game'}
    </button>
  );
}
```

## Environment variables

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=0x...
```

## Related resources

- [Farcaster Snaps Docs](https://docs.farcaster.xyz/snap)
- [Base MiniKit Docs](https://docs.base.org/docs/tools/minikit)
- [FIP: Live Activity (Farcaster Protocol Discussion #268)](https://github.com/farcasterxyz/protocol/discussions/268)
- [FIP: Live Activity (Farcaster Protocol Discussion #269)](https://github.com/farcasterxyz/protocol/discussions/269)
- [builders-garden/base-minikit-starter](https://github.com/builders-garden/base-minikit-starter)
