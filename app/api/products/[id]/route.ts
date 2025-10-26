import { connectionToDb } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";


export async function GET(props: { params: Promise<{ id: string }> }) {
    console.log("Inside the get specific product route")
    try {
        const { id } = await props.params;

        console.log("db connected before ", typeof id);

        await connectionToDb();

        console.log("db connected")
        const product = await Product.findById(id).lean();

        console.log("product of specific id ", product);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json(product, { status: 200 })

    } catch (error) {
        console.error("Error in fetching specific product:", error);
        return NextResponse.json(
            { error: "Failed to fetch specific product" },
            { status: 500 }
        );
    }
}