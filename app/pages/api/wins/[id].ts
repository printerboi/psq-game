import { Game } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db';
require('dotenv').config();

//Special type for custom response-error-messages
type ResponseData = {
    errorcode: number,
    message: String | Game,
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {

    //Check if the request is a post request
    if(req.method == "GET"){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid != 1){
                let userIdString = req.query.id as string;

                if( userIdString ){
                    let userId = parseInt(userIdString);

                    if( !isNaN(userId) && userId != -1 ){

                        const games = await prisma.game.findMany({
                            include: {
                                ratings: {
                                    include: {
                                        createdBy: true,
                                    }
                                },
                                winner: true,
                            },
                            where: {
                                AND: [
                                    {
                                        winnerId: {
                                            equals: userId,
                                        },
                                    },
                                ]
                            }
                        });

                        if(games == null){
                            return res.status(404).send({errorcode: 0, message: "0"});
                        }else{
                            return res.status(200).send({errorcode: 0, message: games.length.toString()});
                        }

                    }else{
                        return res.status(400).send({ errorcode: 4, message: "Bad request" });
                    }

                }else{
                    return res.status(400).send({ errorcode: 3, message: "Bad request" });
                }
            }else{
                //If the needed data is not provided, send a bad request
                return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
            }
        }
    }else{
        return res.status(400).send({ errorcode: 1, message: "The request method is forbidden!" });
    }
}