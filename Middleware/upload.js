// const path =    require('path')
// const multer=   require('multer')
// import path from 'path'
import multer from "multer";
import { createReadStream } from "fs";

import { join } from "path";
import path from "path";
import fs from "fs";
import { google } from "googleapis";

const __dirname =
  "D:\\Tai lieu\\Ki_20221\\Cong nghe Web va dich vu truc tuyen\\booking-webapp\\api\\";
const CLIENT_ID =
  "1001056779732-v0r99ehqpf6b7h71vm8kd7obtfu8dn8q.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
  "1//04zwFT-_-JpS2CgYIARAAGAQSNwF-L9IrnBfaQmf5MEc7O4ofxhU3P1a2Up-FtIYvS8y3VOKxXUyN2s1XX3srNFfpcC74-MEcoPA";

const GOOGLE_API_FOLDER_ID = "1i7ujVwdkaDNtsXDtroWd0SxYm4chObzy";

// export async function uploadFile2(req){
//     try{
//         const auth = new google.auth.GoogleAuth({
//             keyFile:'./bookingWebAppKey.json',
//             scopes: ['https://www.googleapis.com/auth/drive']
//         })
//
//         const driveService = google.drive({
//             version:'v3',
//             auth
//         })
//
//         const fileMetaData ={
//             'name':req,
//             'parents':[GOOGLE_API_FOLDER_ID] //to stored the file
//         }
//
//         const media = {
//             MimeType: 'image/jpg , image/png',
//             body: fs.createReadStream(req)
//         }
//
//         const response = await driveService.files.create({
//             resource: fileMetaData,
//             media:media,
//             fields:'id'
//         })
//
//         return response.data.id
//     }catch(err){
//         console.log('Upload file error', err);
//     }
// }
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
      callback(null, true);
    } else {
      console.log("Wrong type of image or not an image");
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

// const filePath = join(__dirname,'test.jpg')

export const uploadFile = async (req, folderId) => {
  try {
    // const fileMetaData ={
    //     name: req.substring(84),
    //     'parents':[GOOGLE_API_FOLDER_ID] //to stored the file
    // }

    const fileMetaData = {
      name: req.substring(84),
      parents: [folderId], //to stored the file
    };

    const media = {
      MimeType: "image/jpg , image/png",
      body: fs.createReadStream(req),
    };

    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: "id",
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const deleteFile = async (req) => {
  const fileId=req.substring(43);
  try {
    const deleteFile = await drive.files.delete({
      fileId: fileId,
    });
    console.log(deleteFile.data, deleteFile.status);
  } catch (error) {
    console.log(error);
  }
};

// module.exports=upload
