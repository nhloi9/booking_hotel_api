import City from "../Model/city.js";
import {uploadFile} from "../Middleware/upload.js";
const CITY_FOLDER_ID='1rZx-0X07RnSGpPcNOtJ_wMHmoh515aH9';
export const addCity= async(req,res,next)=>{

    try{
        console.log(req.body)
        const city = new City({
            ...req.body
        });

        if(req.file){
            city.img=req.file.path
        }
        await city.save();


        let data=await uploadFile(req.file.path,CITY_FOLDER_ID);
        const link=`https://drive.google.com/uc?export=view&id=${data.id}`
        await city.updateOne({
            img:link
        })
        res.status(200).json({
            message: "Hotel has been created."
        });
    }catch(err){
        next(err);
    }
}