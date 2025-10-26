import { authOptions } from "@/lib/auth";
import { connectionToDb } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId, variant } = await req.json();
        await connectionToDb();

        //Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.floor(variant.price * 100),
            currency: "USD",
            receipt: `order_rcpt_${Date.now()}`,
            notes: {
                productId: productId.toString()
            },
            payment_capture: true // Auto capture payment
        })

        const newOrder = await Order.create({
            userId: session.user.id,
            productId,
            variant,
            razorpayOrderId: order.id,
            amount: variant.price,
            status: "pending",
        })

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            dbOrderId: newOrder._id
        }, { status: 201 })

    } catch (error) {
        console.error("Error in creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
