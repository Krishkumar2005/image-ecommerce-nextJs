import {DefaultSession} from "next-auth"
//extending the types of next-auth in TypeScript
declare module "next-auth"{
    interface Session{
        user: {
            role: string;
            id: string;
        } & DefaultSession["user"];//merges these fields with the default ones like { user: { name?: string; email?: string; image?: string } }.
    }

    interface User {
        role: string;
    }
}

//We extend next-auth types because the default types don’t include my custom fields, like role or id.