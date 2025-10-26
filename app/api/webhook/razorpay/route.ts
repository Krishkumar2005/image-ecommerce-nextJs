import { connectionToDb } from "@/lib/db";
import Order from "@/models/Order";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const body = await req.text() //req.text() gives the raw body of the request in string format only
        const signature = req.headers.get("x-razorpay-signature") //get the signature from the request header
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(body).digest("hex")

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        const event = JSON.parse(body)
        await connectionToDb()

        console.log("Razorpay Webhook Event:", event)

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity

            const order = await Order.findOneAndUpdate({ razorpayOrderId: payment.order_id }, {
                status: "completed",
                razorpayPaymentId: payment.id
            }).populate([
                { path: "userId", select: "email" },
                { path: "productId", select: "name" },
            ])

            if (!order) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 })
            }

            if (order) {
                //Send email only after payment is confirmed
                const transporter = nodemailer.createTransport({
                    host: process.env.MAILTRAP_HOST as string,
                    port: Number(process.env.MAILTRAP_PORT),
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.MAILTRAP_USER,
                        pass: process.env.MAILTRAP_PASS,
                    },
                });
                await transporter.sendMail({
                    from: '"ImageKit Shop" <noreply@imagekitshop.com>',
                    to: typeof order.userId === "object" && "email" in order.userId ? (order.userId as { email: string }).email : "<Unknown Email>",
                    subject: "Payment Confirmation - ImageKit Shop",
                    text: `
    Thank you for your purchase!

    Order Details:
    - Order ID: ${order._id.toString().slice(-6)}
    - Product: ${typeof order.productId === "object" && "name" in order.productId ? (order.productId as { name: string }).name : "Unknown Product"}
    - Version: ${order.variant.type}
    - License: ${order.variant.license}
    - Price: $${order.amount.toFixed(2)}

    Your image is now available in your orders page.
    Thank you for shopping with ImageKit Shop!
            `.trim(),
                });
            }
        }

        return NextResponse.json({received: true}, {status: 200});

    } catch (error) {
        console.error("Error handling Razorpay webhook:", error);
        return NextResponse.json({ error: "Internal Server Error WebHook Failed" }, { status: 500 });
    }
}