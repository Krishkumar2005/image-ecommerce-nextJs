import mongoose, { mongo } from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Check your database connection string in env file");
}

let cached = global.mongoose;

//Means no connection then make explicitly our cache
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectionToDb() {
    console.log("connection db called")
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose.connection);
    }

    try {
        cached.conn = await cached.promise
        console.log("DB Connected")
    } catch (error) {
        cached.promise = null
        console.log("DB Errrr : ", error)
        throw error
    }

    return cached.conn;
}
