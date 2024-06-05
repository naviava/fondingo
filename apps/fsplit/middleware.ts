import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(async (req: NextRequest) => {
  const token = await getToken({ req });
  console.log(req);
  if (
    req.nextUrl.pathname !== "/account" &&
    req.nextUrl.pathname !== "/verify" &&
    !token?.isVerified
  ) {
    return NextResponse.redirect(new URL("/verify", req.url));
  }

  if (req.nextUrl.pathname === "/verify" && token?.isVerified) {
    return NextResponse.redirect(new URL("/groups", req.url));
  }
});

export const config = {
  matcher: [
    "/account/:path*",
    "/activity/:path*",
    "/create-group/:path*",
    "/friends/:path*",
    "/groups/:path*",
    "/verify/:path*",
  ],
};
