import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI

if (!uri) {
    throw new Error("Please add your MongoDB URI to .env");
}

//Create Product Schema matching Product.ts

const imageVariantSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["SQUARE", "WIDE", "PORTRAIT"],
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    license: {
        type: String,
        required: true,
        enum: ["personal", "commercial"],
    }
});
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        //price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        variants: [imageVariantSchema]
    },
    { timestamps: true }

)

//create the model

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const dummyProducts = [
    {
        name: "Classic Camera",
        description: "A vintage-style camera with modern features",
        //price: 599.99,
        imageUrl: "dummy-camera.jpg",
        variants: [{
            type: "SQUARE",
            price: 10,
            license: "commercial"
        },
        {
            type: "WIDE",
            price: 20,
            license: "personal"
        }]
    },
    {
        name: "Professional Lens",
        description: "High-quality lens for professional photography",
        //price: 899.99,
        imageUrl: "dummy-lens.jpg",
        variants: [{
            type: "SQUARE",
            price: 10,
            license: "commercial"
        }, {
            type: "WIDE",
            price: 20,
            license: "personal"
        }]
    },
    {
        name: "Camera Tripod",
        description: "Sturdy tripod for stable shots",
        price: 149.99,
        imageUrl: "dummy-tripod.jpg",
        variants: [{
            type: "SQUARE",
            price: 10,
            license: "commercial"
        }, {
            type: "WIDE",
            price: 20,
            license: "personal"
        }]
    },
    {
        name: "Camera Bag",
        description: "Spacious bag for all your photography gear",
        price: 79.99,
        imageUrl: "dummy-bag.jpg",
        variants: [{
            type: "SQUARE",
            price: 10,
            license: "commercial"
        }, {
            type: "WIDE",
            price: 20,
            license: "personal"
        }]
    },
    {
        name: "LED Light Kit",
        description: "Professional lighting kit for studio photography",
        price: 299.99,
        imageUrl: "dummy-light-kit.jpg",
        variants: [{
            type: "SQUARE",
            price: 10,
            license: "commercial"
        }, {
            type: "WIDE",
            price: 20,
            license: "personal"
        }]
    },
];

async function seed() {
    try {
        await mongoose.connect(uri, {
            maxPoolSize: 10,
        });
        console.log("Connected to database");

        //Clear existing data
        await Product.deleteMany({});
        console.log("Cleared existing products");

        //Add dummy products
        const result = await Product.insertMany(dummyProducts);
        console.log(`Added ${result.length} dummy products`);

        console.log("Seeding completed successfully");

    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the seed function
seed();