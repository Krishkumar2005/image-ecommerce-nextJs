import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { connectionToDb } from "./db";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }

                try {
                    await connectionToDb();
                    const user = await UserModel.findOne({
                        email: credentials.email
                    });

                    if (!user) {
                        throw new Error("No user found with this email")
                    }

                    console.log(credentials.password, user.password)

                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    console.log("isValidPassword ", isValidPassword)
                    if (!isValidPassword) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role,
                    };



                } catch (error) {
                    console.error("Auth error:", error);
                    throw error
                   // throw new Error("Next-Auth Error ",error);
                }
            },
        }),
    ],

    callbacks: {
        async jwt({token, user}) {
            if(user){
                token.role  = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({session, token}){
            if(session.user){
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};