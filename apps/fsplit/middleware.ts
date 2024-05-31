import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(async (req: NextRequest) => {});

export const config = {
  matcher: [
    "/account/:path*",
    "/activity/:path*",
    "/create-group/:path*",
    "/friends/:path*",
    "/groups/:path*",
  ],
};
