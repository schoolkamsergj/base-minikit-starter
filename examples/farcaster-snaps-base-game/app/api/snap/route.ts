import { NextRequest, NextResponse } from 'next/server';

/**
 * Farcaster Snap endpoint.
 * Renders an interactive "Play Base Invaders" button inside a Farcaster cast.
 *
 * Docs: https://docs.farcaster.xyz/snap
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const fid: number | undefined = body?.untrustedData?.fid;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  return NextResponse.json({
    type: 'snap',
    snap: {
      version: '1',
      components: [
        {
          type: 'image',
          src: `${appUrl}/og-image.png`,
          aspectRatio: '1.91:1',
        },
        {
          type: 'button',
          label: fid ? `▶ Play as FID ${fid}` : '▶ Play Base Invaders',
          action: 'link',
          target: `${appUrl}?fid=${fid ?? ''}`,
        },
      ],
    },
  });
}
