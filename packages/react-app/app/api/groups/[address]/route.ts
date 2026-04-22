import { NextResponse } from "next/server";
import { getCachedGroupState } from "@/app/api/_lib/groupCache";

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

    return NextResponse.json(groupState);
  } catch {
    return NextResponse.json({ error: "Unable to fetch group state." }, { status: 502 });
  }
}
