import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../db';
require('dotenv').config();

//Special type for custom response-error-messages
type ResponseData = {
    errorcode: number,
    message: String,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    //Check if the request is a get request
    if(req.method == 'GET'){

        //Check if querying user is logged in
        if(req.cookies.login){

            //Search database for the provided username
            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid == 1){
                let param = req.query;
        
                //Search database for the provided email
                const user = await prisma.user.findFirst({
                    select: {
                        id: true
                    },
                    where: { username: param.search as string }
                });
                
                //handle the case that the email isn't taken
                if( !user ){
                    return res.status(200).send({errorcode: -1, message: "Not found"});
                }else{
                    return res.status(200).send({errorcode: -2, message: "found"});
                }
            }else{
                return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
            }
        }else{
            return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
        }
    }else{
        //If the request is anything other than a POST
        return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
    }
}
