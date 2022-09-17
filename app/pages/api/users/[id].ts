import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { prisma } from '../../../db';
require('dotenv').config();

//Special type for custom response-error-messages
type ResponseData = {
    errorcode: number,
    message: String,
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    //Check if the request is a post request
    if(req.method == 'DELETE'){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            console.log(loginObj);

            if(loginObj.roleid == 1){
                let userIdString = req.query.id as string;

                if( userIdString ){
                    let userId = parseInt(userIdString);

                    if( !isNaN(userId) && userId != 1 ){

                        console.log(userId);

                        let del = await prisma.user.delete({
                            where: {
                                id: userId 
                            }
                        });

                        return res.status(200).send({errorcode: -1, message: "OK"});

                    }else{
                        return res.status(400).send({ errorcode: 3, message: "Bad request" });
                    }
                }else{
                    return res.status(400).send({ errorcode: 3, message: "Bad request" });
                }
            }else{
                //If the needed data is not provided, send a bad request
                return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
            }
        }else{
            return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
        }

    }else if(req.method == 'PUT'){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            let userIdString = req.query.id as string;

            if( userIdString ){
                let userId = parseInt(userIdString);

                if( !isNaN(userId) && userId != 1 && userId == loginObj.id ){


                    let data = req.body;

                    //Check if the needed fields are provided
                    if( data.password ){
                        try {
                            let password = data.password;
    
                            const pepper = process.env.PEPPER;
    
                            const salt = bcrypt.genSaltSync(12);
                            const hash = bcrypt.hashSync(password + salt + pepper, 12);
    
                            const updatedUser = await prisma.user.update({
                                data: {
                                    password: hash,
                                    salt: salt,
                                },
                                where: {
                                    id: userId
                                }
                            });
    
                            //Query users with prisma with the provided username
                            
                        }catch(e){
                            return res.status(400).send({ errorcode: 1, message: "The provided Data has the wrong format" });
                        }

                        return res.status(200).send({errorcode: -1, message: "OK"});
                    }

                }else{
                    return res.status(400).send({ errorcode: 3, message: "Bad request" });
                }
            }else{
                return res.status(400).send({ errorcode: 3, message: "Bad request" });
            }
            
        }else{
            return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
        }
    
    }else{
        //If the request is anything other than a POST
        return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
    }
}
