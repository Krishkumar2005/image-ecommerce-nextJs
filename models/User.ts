import mongoose, { model, models, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser {
    _id?: mongoose.Types.ObjectId;
    email: string;
    password: string;
    role: "user" | "admin";
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    }
    ,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }

},
    { timestamps: true }
)

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        console.log("this.password in user schema ", this.password);
        this.password = await bcrypt.hash(this.password, 10);
    }

    next()
})

const User = models?.User as Model<IUser> || model<IUser>("User", userSchema)

export default User