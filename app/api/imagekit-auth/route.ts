import { getUploadAuthParams } from "@imagekit/next/server"

async function GET() {
    try {
        const { token, signature, expire } = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!
        })

        console.log("Auth parameter in imagekit-auth", { token, signature, expire });

        return Response.json({
            token, signature, expire, publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY
        })
    } catch (error) {
        return Response.json(
            { error: "Authentication for Imagekit failed" },
            { status: 500 }
        )
    }
}