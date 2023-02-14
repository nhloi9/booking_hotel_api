import mongoose from "mongoose";
import Hotel from "./hotel.js";
import Order from "./order.js";

const RoomSchema = new mongoose.Schema(
    {
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },
        city:{
            type: String,
        },
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        maxPeople: {
            type: Number,
            required: true,
        },
        desc: { // description
            type: String,
            required: true,
        },
        roomOrder:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            }
        ],
    },
    {timestamps: true}
);

export default mongoose.model("Room", RoomSchema);