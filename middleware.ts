import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import path from "path";

export default withAuth(
    //The middleware function will only be invoked if the authorized callback returns true.
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {

                const { pathname } = req.nextUrl;

                // Allow webhook endpoint
                if (pathname.startsWith("/api/webhook")) {
                    return true;
                }

                //Allow auth-related routes 
                if (pathname.startsWith("/api/auth") ||
                    pathname === "/login" ||
                    pathname === "/register") {
                    return true;
                }

                //Public routes 
                if (
                    pathname === "/" ||
                    pathname.startsWith("/api/products") ||
                    pathname.startsWith("/products")
                ) {
                    return true;
                }

               // Admin routes require admin role
                if (pathname.startsWith("/admin")) {
                  return token?.role === "admin";
                  //return true
                }

                // All other routes require authentication
                return !!token; //we don't want to return 0 or NaN(not a number) that's why we use !! to coerce it to a boolean
                // first exclamation mark negates the value and convert it in boolean and second negates it back it to the original value
            }
        }
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};