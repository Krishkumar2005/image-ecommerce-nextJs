import { Connection } from "mongoose";

declare global{
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null
    };
    // interface Window{
    //     Razorpay: any;
    // }
}

export {}//<-- this is needed to make this a module