import { NextRequest, NextResponse } from "next/server";
import { getCachedInviteMetadata } from "@/app/api/_lib/inviteCache";

const INVITE_RESPONSE_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=30";

export async function GET(request: NextRequest) {
  const inviteCode = request.nextUrl.searchParams.get("code")?.trim() ?? "";

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
  }

  const invite = await getCachedInviteMetadata(inviteCode);
  if (!invite) {
    return NextResponse.json({ error: "Invite code not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      groupAddress: invite.groupAddress,
      name: invite.name,
      amount: invite.amount,
      frequency: invite.frequency,
      memberCount: invite.memberCount,
      maxMembers: invite.maxMembers,
    },
    {
      headers: {
        "Cache-Control": INVITE_RESPONSE_CACHE_CONTROL,
      },
    },
  );
}
