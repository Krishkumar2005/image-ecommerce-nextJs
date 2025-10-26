import { authOptions } from "@/lib/auth";
import { connectionToDb } from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
    try {
        console.log("products fetching called")
        await connectionToDb();
        const products = await Product.find({}).lean();

        console.log("Fetched products count:", products);
        if (!products || products.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(products, { status: 200 });

    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );

    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectionToDb();
        const body: IProduct = await req.json()

        if (!body.name || !body.imageUrl || !body.variants || body.variants.length === 0) {
            return NextResponse.json({
                error: "Missing required fields"
            }, { status: 400 })
        }

        //validate variants
        for (const variant of body.variants) {
            if (!variant.type || !variant.price || !variant.license) {
                return NextResponse.json({
                    error: "Missing required fields in variants"
                }, { status: 400 })
            }
        }

        const newProduct = await Product.create(body);
        return NextResponse.json(newProduct, { status: 201 });

    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}