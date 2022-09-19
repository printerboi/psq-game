import type { NextApiRequest, NextApiResponse } from 'next';
require('dotenv').config();
import { prisma } from '../../db';

//Special type for custom response-error-messages
type ResponseData = {
    errorcode: number,
    message: String,
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    //Check if the request is a post request
    if(req.method == 'POST'){

        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid != 1){
                //Get the POST-data
                let data = req.body;

                console.log(data);

                //Check if the needed fields are provided
                if( data.createdBy && data.shop && data.shop != "" && data.sum){
                    try {
                        let createdBy = parseInt(data.createdBy);
                        let shop = data.shop;
                        let amount = parseFloat(data.sum);
                        let now = Date.now().toString();

                        if(amount >= 0){
                            const nGame = await prisma.game.create({
                                data:{
                                    createdById: createdBy,
                                    createdAt: now,
                                    shop: shop,
                                    sum: amount,
                                }
                            });
    
                            let gameCode = Buffer.from(nGame.id.toString()).toString('base64');
    
                            return res.status(200).send({ errorcode: 1, message: gameCode });
                        }else{
                            return res.status(400).send({ errorcode: 97, message: "The sum is malformed!" });
                        }
                    }catch(e){
                        console.log(e);
                        return res.status(400).send({ errorcode: 1, message: "The provided Data has the wrong format" });
                    }

                }else{
                    return res.status(400).send({ errorcode: 99, message: "The data is missing some attributes!" });
                }
            }else{
                //If the needed data is not provided, send a bad request
                return res.status(400).send({ errorcode: 1, message: "Please provide all the neccessary data" });
            }
        }else{
            return res.status(400).send({ errorcode: 98, message: "The request method is forbidden!" });
        }
    }else{
        //If the request is anything other than a POST
        return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
    }
}