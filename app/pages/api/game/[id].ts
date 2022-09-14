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
    if(req.method == 'DELETE'){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid != 1){
                let gameIdString = req.query.id as string;

                if( gameIdString ){
                    let gameId = parseInt(gameIdString);

                    if( !isNaN(gameId) && gameId != -1 ){
                        const gameToDelete = await prisma.game.findFirst({
                            where: { id: gameId }
                        });

                        if(gameToDelete){
                            const game = await prisma.game.delete({
                                where: { id: gameToDelete.id }
                            });
    
                            return res.status(200).send({errorcode: 0, message: "OK"});
                        }else{
                            return res.status(400).send({ errorcode: 3, message: "No game was found for thie given id!" });
                        }

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
    
    }else if(req.method == "PUT"){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid != 1){
                let gameIdString = req.query.id as string;

                if( gameIdString ){
                    let gameId = parseInt(gameIdString);

                    if( !isNaN(gameId) && gameId != -1 ){
                        let data = req.body;

                        if(data.winnerId){
                            let winner = data.winnerId;
                            
                            const ngame = await prisma.game.update({
                                data:{
                                    winnerId: winner 
                                },
                                where: {
                                    id: gameId,
                                }
                            });

                            return res.status(200).send({errorcode: 0, message: "OK"});
                        }else{
                            return res.status(400).send({ errorcode: 3, message: "Bad request" });
                        }

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
    }else if(req.method == "GET"){
        if(req.cookies.login){

            let loginObj = JSON.parse(Buffer.from(req.cookies.login, 'base64').toString('ascii'));

            if(loginObj.roleid != 1){
                let gameIdString = req.query.id as string;

                if( gameIdString ){
                    let gameId = parseInt(gameIdString);

                    if( !isNaN(gameId) && gameId != -1 ){

                        const game = await prisma.game.findFirst({
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
                                        id: {
                                            equals: gameId,
                                        },
                                    },
                                    {
                                        createdBy: {
                                            equals: loginObj.id,
                                        },
                                    }
                                ]
                            }
                        });

                        if(game == null){
                            return res.status(404).send({errorcode: 0, message: "Game not found"});
                        }else{
                            return res.status(200).send({errorcode: 0, message: game});
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