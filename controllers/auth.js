import User from "../Model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {checkPassword} from "../utils/validate.js";
import {deleteFile, uploadFile} from "../Middleware/upload.js";
import {INVALID, SUCCESS} from "../utils/Constant.js";

const USER_FOLDER_ID='1i7ujVwdkaDNtsXDtroWd0SxYm4chObzy';

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const hashConfirm=bcrypt.hashSync(req.body.confirmPassword,salt);
    let error=[];

    if(!checkPassword(req.body.password)){
      error.push("Password must between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter")
    }

    if(req.body.password!==req.body.confirmPassword){
      return res.status(400).json({
        message:"Input invalid",
        errors:"Password don't match"
      });
    }

    if(error.length!==0){
      return res.status(400).json({
        message:"Input invalid",
        errors:error
      })
    }


    const newUser = new User({
      ...req.body,
      password: hash,
      confirmPassword: hashConfirm,
    });

    res.status(200).json({
      message:"User has been created."
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({
        message:"Input invalid",
        errors:"User not found"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message:"Input invalid",
        errors:"Wrong password or username!"
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password,confirmPassword, isAdmin, ...otherDetails } = user._doc;
    res.cookie("token", token, {
      httpOnly: true,
    })
      .status(200)
      .json({ details: { ...otherDetails } });
  } catch (err) {
    next(err);
  }
};

export const logout= async(req,res,next)=>{
  try{
    res.clearCookie("token");
    res.status(200).json({
      message:"Logout succesfully"
    });
  }catch(err){
    next(err);
  }
}

export const changeAvatar = async(req,res,next)=>{
  try{
    const userId=req.params.userId;
    const user = await User.findById(userId);
    if(user!==null){
      if(req.file){
        user.img=req.file.path
      }

      let data=await uploadFile(req.file.path,USER_FOLDER_ID);
      const link=`https://drive.google.com/uc?export=view&id=${data.id}`
      await user.updateOne({
        img:link
      })
      console.log(link)
      res.status(200).json({
        message:"Update avatar success.",
        url: link,
      });
    }
  }catch(err){

  }
}

export const deleteAvatar=async(req,res,next)=>{
  try{
      const userId=req.params.userId;
      const user = await User.findById(userId);
      if(user!==null){
        const link= user.img;
        const status= await deleteFile(link);
        console.log(status);
        await user.updateOne({
          img:null,
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

