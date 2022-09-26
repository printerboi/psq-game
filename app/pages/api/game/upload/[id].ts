import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import Jimp from 'jimp';
import convert from 'heic-convert';

let uploadedFileName = "";
let globalFileName = "ccccc";
let globalType = "";
let globalMimeType = "";

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/.cache',
    filename: async (req, file, cb) => {
      let id = req.query.id;

      console.log(file.mimetype);
      
      if(file.mimetype == "image/png"){
        globalType = ".png";
      }else if(file.mimetype == "image/jpg"){
        globalType = ".jpg";
      }else if(file.mimetype == "image/jpeg"){
        globalType = ".jpeg";
      }else if(file.mimetype == "image/gif"){
        globalType = ".gif";
      }else if(file.mimetype == "image/webp"){
        globalType = ".webp";
      }else if(file.mimetype == 'image/heic'){
        globalType = ".heic";
      }else if(file.mimetype == 'image/heif'){
        globalType = ".heif";
      }

      globalMimeType = file.mimetype;
      globalFileName = id as string;
      uploadedFileName = id + globalType;
      cb(null, uploadedFileName);
    },
  }),
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    return res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },

});

apiRoute.use(upload.array('watchImage'));

apiRoute.post(async (req, res) => {

  if(req.cookies.login){

    let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

    //Test if the user is either an admin or an employee
    if(loginObj.roleid != 1){
      //Load the image in the .cache directory which can be cleaned afterwards
      let oldfile = './public/.cache/' + uploadedFileName;
      let newFile = './public/uploads/' + globalFileName + '.png';

      try{
        let exists = fs.existsSync(newFile);
        console.log('Datei existiert?:', exists);

        if(exists){
          fs.unlinkSync(newFile);
        }

        //This code seems highly illegal, as the files are not converted and only written into a new file with a different extension...
        //But if it works, it works...
        let cachedFileBuffer = fs.readFileSync(oldfile);

        let correctedFileBuffer = cachedFileBuffer;

        if(globalMimeType == 'image/heif' || globalMimeType == 'image/heic'){
          const outputBuffer = await convert({
            buffer: cachedFileBuffer, // the HEIC file buffer
            format: 'PNG'        // output format
          })

          fs.writeFileSync('./public/.cache/' + globalFileName + '.png', Buffer.from(outputBuffer));
        }


        Jimp.read(oldfile, (err, lenna) => {
          if (err) throw err;
          lenna
            .write(newFile); // save
        });
        

        //fs.writeFileSync(newFile, correctedFileBuffer);
        fs.unlinkSync(oldfile);
      }catch(e){
        console.log('FEHLER:', e);
        return res.status(501).json({ error: `Sorry something Happened! ${e}` });
      }

      //Convert the file
      console.log('Der Dateiname lautet ', newFile);
      
      /* sharp(oldfile)
        .toFormat('png')
        .toFile(newFile)
        .then((info) => { console.log(info) })
        .catch((err) => { console.log(err); }) */
      

      /* .toBuffer(function(err, buffer) {
        fs.writeFile(newFile, buffer, async function(e) {
          
          await fs.unlinkSync(oldfile);
            });
        }); */

      return res.status(200).json({ name: globalFileName + '.png' });
    }
  }
});

apiRoute.delete(async (req, res) => {
  let file = './public/uploads/' + Buffer.from(""+ req.query.id).toString('base64') + '.png';
  await fs.unlinkSync(file);
  return res.status(200).json({ data: "succes" });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};