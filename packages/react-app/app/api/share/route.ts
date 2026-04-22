import { isAddress, type Hex } from "viem";
import { NextRequest, NextResponse } from "next/server";
import { INVITE_CODE_PATTERN } from "@/app/api/_lib/constants";
import { getCachedGroupState } from "@/app/api/_lib/groupCache";
import { enforceRateLimit } from "@/app/api/_lib/rateLimit";
import { buildSharePayload } from "@/app/api/_lib/shareFormatter";

type ShareRequestBody = {
  groupAddress?: string;
  inviteCode?: string;
};

function resolveAppUrl(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const rateLimit = enforceRateLimit(request.headers);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Try again in a minute.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      },
    );
  }

  let body: ShareRequestBody;

  try {
    body = (await request.json()) as ShareRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const groupAddress = body.groupAddress?.trim();
  const inviteCode = body.inviteCode?.trim();

  if (!groupAddress || !isAddress(groupAddress)) {
    return NextResponse.json({ error: "A valid groupAddress is required." }, { status: 400 });
  }

  if (!inviteCode || !INVITE_CODE_PATTERN.test(inviteCode)) {
    return NextResponse.json({ error: "A valid inviteCode is required." }, { status: 400 });
  }

  try {
    const groupState = await getCachedGroupState(groupAddress);
    if (!groupState) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    if (groupState.inviteCode.toLowerCase() !== inviteCode.toLowerCase()) {
      return NextResponse.json({ error: "Invite code does not match this group." }, { status: 404 });
    }

    const payload = buildSharePayload({
      appUrl: resolveAppUrl(request),
      inviteCode: inviteCode.toLowerCase() as Hex,
      groupName: groupState.name,
      contributionAmount: BigInt(groupState.contributionAmount),
      frequencyInDays: BigInt(groupState.frequencyInDays),
      memberCount: groupState.memberCount,
      maxMembers: BigInt(groupState.maxMembers),
    });

    return NextResponse.json(payload, {
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimit.resetAt / 1000)),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to build share payload." }, { status: 502 });
  }
}
