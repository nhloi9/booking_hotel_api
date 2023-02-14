import {createError} from "../utils/createError.js";
import Hotel from "../Model/hotel.js";
import {INVALID, SUCCESS} from "../utils/Constant.js"
const HOTEL_FOLDER_ID='1uMtIZTJAzxnD0gxF-H5Q0a83q3Ijx0Cf'
const __dirname = 'D:\\Tai lieu\\Ki_20221\\Cong nghe Web va dich vu truc tuyen\\booking-webapp\\api\\';
import { join } from 'path';
import {deleteFile, uploadFile} from "../Middleware/upload.js";
import City from "../Model/city.js";
import User from "../Model/user.js";
function sumArray(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / (array.length);
}

async function validateHotel(req) {
    let errors = [];
    if (req.body.maxRoom <= 0 || !Number.isInteger(req.body.maxRoom)) {
        errors.push("Max room is invalid!")
    }

    if (req.body.cheapestPrice < 0 || Number.isNaN(req.body.cheapestPrice)) {
        errors.push("Cheapest price is invalid!");
    }
    const city = await City.find({
        name: req.body.city
    })
    console.log(city)

    if(city.length===0){
        errors.push("No city was found.")
    }
    if(req.body.stars<0 || req.body.stars>5 || Number.isNaN(req.body.stars)){
        errors.push("Stars invalid.!")
    }
    return errors;
}

export const createHotel = async (req, res, next) => {
    try {
        let errors = await validateHotel(req);
        if (errors.length !== 0) {
            return res.status(400).json({
                message: "Input invalid",
                errors: errors
            })
        }
        const newHotel = new Hotel({
            ...req.body
        });

        // if(req.file){
        //     newHotel.img=req.file.path
        // }
        await newHotel.save();

        // const filePath = join(__dirname,req.file.path)
        // console.log(filePath);
        // let data=await uploadFile(filePath,HOTEL_FOLDER_ID);
        // const link=`https://drive.google.com/uc?export=view&id=${data.id}`
        // await newHotel.updateOne({
        //     photos:link
        // })
        res.status(200).json({
            message: "Hotel has been created."
        });
    } catch (err) {
        next(err)
    }

}



export const updateHotel = async (req, res, next) => {
    try {
        let errors = validateHotel(req);
        if (errors.length !== 0) {
            return res.status(400).json({
                message: "Input invalid",
                errors: errors
            })
        }

        const hotelId = req.params.id
        const updateHotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            {$set: req.body},
            {new: true}
        )
        res.status(200).json(updateHotel);
    } catch (err) {
        next(createError(404, "Can't update hotel!"));
    }
}

export const getById = async (req, res, next) => {
    try {
        const hotelData = await Hotel.findById(req.params.id);
        const {countRate, ...otherDetails} = hotelData._doc;
        res.status(200).json(...otherDetails);
    } catch (err) {
        next(createError(404, "Hotel id is not found"))
    }
}


export const getAll = async (req, res, next) => {
    try {
        const hotelList = await Hotel.find({});
        const len = hotelList.length;
        let result = [];
        for (let i = 0; i < len; i++) {
            const {countRate, ...otherDetails} = hotelList[i]._doc;
            result.push({...otherDetails})
        }
        res.status(200).json({
            size: len,
            details: result
        });
    } catch (err) {
        next(err);
    }
}

export const getByCity = async(req,res,next)=>{
    try{
        const city=req.body.city;
        const hotel = await Hotel.find({
            'city': {
                '$regex': city,
                 "$options": "i",
            }
        })
        const len = hotel.length;
        let result = [];
        for (let i = 0; i < len; i++) {
            const {countRate, ...otherDetails} = hotel[i]._doc;
            result.push({...otherDetails})
        }
        res.status(200).json({
            size: len,
            details: result
        });
    }catch(err){
        next(err)
    }
}

export const getByStars=async(req,res,next)=>{
    try{
        const city=req.body.city;
        const hotel = await Hotel.find({
            stars: {$gte: req.body.stars}
        })
        const len = hotel.length;
        let result = [];
        for (let i = 0; i < len; i++) {
            const {countRate, ...otherDetails} = hotel[i]._doc;
            result.push({...otherDetails})
        }
        res.status(200).json({
            size: len,
            details: result
        });
    }catch(err){
        next(err)
    }
}

export const getHotelByPrice = async (req, res, next) => {
    const lowPrice = req.body.lowestPrice;
    const highPrice = req.body.highestPrice;
    if (/*!Number.isNaN(lowPrice)||!Number.isNaN(highPrice)||*/lowPrice < 0 || highPrice < 0 || lowPrice > highPrice ) {
        return res.status(400).json({
            message: INVALID,
            errors: "Price is invalid! Please try again!"
        });
    }
    try {
        const getHotels = await Hotel.find({
            cheapestPrice: {$gte: lowPrice, $lte: highPrice}
        });

        const len = getHotels.length;
        let result = [];
        for (let i = 0; i < len; i++) {
            const {countRate, ...otherDetails} = getHotels[i]._doc;
            result.push({...otherDetails})
        }

        res.status(200).json({
            message: SUCCESS,
            length: len,
            details: result
        });
    } catch (err) {
        next(err);
    }
}



export const getByAll = async(req,res,next)=>{
    try{
        const request=req.body;
        if(!req.body.city){
            request.city=""
        }
        console.log(request)
        if(!req.body.highPrice){
            request.highPrice= Number.POSITIVE_INFINITY;
        }
        if(!req.body.lowPrice){
            request.lowPrice= 0;
        }
        if(!req.body.stars){
            request.stars=0;
        }

        // const city=req.body.city;
        const hotel = await Hotel.find({
            $and :[
                {
                    'city': {
                        '$regex': request.city,
                        "$options": "i",
                    }
                },{
                    cheapestPrice: {
                        $gte: request.lowPrice,
                        $lte: request.highPrice
                    }
                },
                {
                    stars:{
                        $gte:request.stars
                    }
                },
            ],
        })
        const len = hotel.length;
        let result = [];
        for (let i = 0; i < len; i++) {
            const {countRate, ...otherDetails} = hotel[i]._doc;
            result.push({...otherDetails})
        }
        res.status(200).json({
            size: len,
            details: result
        });
    }catch(err){
        next(err)
    }
}


export const deleteById = async (req, res, next) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Success",
            details: "Hotel has been deleted"
        });
    } catch (err) {
        next(createError(404, "Hotel id is not found"));
    }
}

export const rate = async (req, res, next) => {
    try {
        const {hotelId, rate} = req.body;
        const hotel = await Hotel.findById(hotelId);
        if ((Number.isNaN(rate)) || rate < 0 || rate > 5) {
            return res.status(400).json({
                message: "Input invalid",
                errors: "Rating number is invalid"
            })
        }
        await hotel.updateOne(
            {
                $push: {
                    countRate: rate
                }
            })

        const avgRate = sumArray(hotel.countRate)
        await hotel.updateOne({
            rating: avgRate,
        })
        console.log(sumArray(hotel.countRate))
        res.status(200).json({
            message: "Rating success"
        });
    } catch (err) {
        next(err);
    }
}

export const uploadPhoto = async(req,res,next)=>{
    try{
        const hotelId=req.params.hotelId;
        const hotel = await Hotel.findById(hotelId);
        if(hotel!==null){
            if(req.file){
                hotel.photos=req.file.path
            }

            let data=await uploadFile(req.file.path,HOTEL_FOLDER_ID);
            const link=`https://drive.google.com/uc?export=view&id=${data.id}`
            await hotel.updateOne({
                $push :{
                    photos: link,
                }
            })
            console.log(link)
            res.status(200).json({
                message:"Upload photos success."
            });
        }
    }catch(err){
        res.status(400).json({
            message: INVALID,
            details:"Some thing went wrong!"
        })
    }
}

export const deletePhotos=async(req,res,next)=>{
    try{
        const hotelId=req.params.hotelId;
        const hotel = await Hotel.findById(hotelId);
        if(hotel!==null){
            const link= req.body.link;
            const status= await deleteFile(link);
            console.log(status);
            await hotel.updateOne({

            })
        }
        res.status(200).json({
            message: SUCCESS,
            details: "Delete success!",
        })
    }catch(err){
        res.status(400).json({
            message: INVALID,
            details:"Some thing went wrong!"
        })
    }
}
//
// export const countByCity = async(req,res,next)=>{
//     Hotel.find({city: req.params.city}).count()
// }