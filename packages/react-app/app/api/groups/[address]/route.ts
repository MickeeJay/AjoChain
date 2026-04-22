import { NextResponse } from "next/server";
import { getCachedGroupState } from "@/app/api/_lib/groupCache";

const GROUP_RESPONSE_CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=15";

type GroupRouteProps = {
  params: {
    address: string;
  };
};

export async function GET(_: Request, { params }: GroupRouteProps) {
  try {
    const groupState = await getCachedGroupState(params.address);

    if (!groupState) {
      return NextResponse.json({ error: "Group address is invalid." }, { status: 404 });
    }

    return NextResponse.json(groupState, {
      headers: {
        "Cache-Control": GROUP_RESPONSE_CACHE_CONTROL,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch group state." }, { status: 502 });
  }
}
