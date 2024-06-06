import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(async (req: NextRequest) => {
  const token = await getToken({ req });
  if (req.nextUrl.pathname !== "/account" && !token?.isVerified) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }
});

export const config = {
  matcher: [
    "/account/:path*",
    "/activity/:path*",
    "/create-group/:path*",
    "/friends/:path*",
    "/groups/:path*",
  ],
};
