import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    img:{
        type: String,
    }
})

export default mongoose.model("City", CitySchema)