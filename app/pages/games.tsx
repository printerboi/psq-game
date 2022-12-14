import type { NextPage } from 'next'
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css';
import styles from '../styles/Games.module.css';
import { GetServerSideProps } from 'next'
import React, { useState } from 'react';
import { PrismaClient } from '@prisma/client';
import { Modal, Button, InputGroup, FormControl, Form, Badge, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import { prisma } from '../db';
import ReducedNavbar from '../components/reducedNavbar';
import Link from 'next/link';

type Login = {
    id: number,
    username: string,
    email: string,
    roleid: number
}

type User = {
    id: number,
    username: String,
    email: String,
    roleid: number
}

type Rating = {
    id: number,
    createdBy: User,
    gameId: number,
    Game: Game,
    value: number,
}

type Game = {
    id: number,
    createdAt: string,
    createdBy: User,
    sum: number,
    shop: string,
    winner: User | null,
    ratings: Array<Rating>,
}

//Define a type for the Data of the NextJS Page props
type PropsData = {
    games: Array<Game>,
}

//We need an interface for the initialprops to use our types
interface InitialProps {
    InitialState: Login,
    Data: PropsData,
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
    //Get the context of the request
    const { req, res } = ctx
    //Get the cookies from the current request
    const {cookies} = req
    
    //Check if the login cookie is set
    if( !cookies.login ){
        //Redirect if the cookie is not set
        res.writeHead(302, { Location: "/login" });
        res.end();
    }

    let login = (cookies.login)? cookies.login: "";
    const state: User = JSON.parse(Buffer.from(login, 'base64').toString('ascii')); 

    let games = await prisma.game.findMany({
        //Define the fields we are querieng
        orderBy: {
            id: 'desc'
        },
        include: {
            winner: true,
        },
        where: { 
            OR: [
                {
                    createdById: {
                        equals: state.id,
                    },
                },
            ]
        }
    });

    return { props: { InitialState: state, Data: {games: games} } }
}



const Games: NextPage<InitialProps> = ( props: InitialProps ) => {
    const router = useRouter();
    const numberFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });

    return (
        <>
            <div className={styles.container}>
                <Head>
                    <title>Games</title>
                    <meta name="description" content="PSQ ??bersicht ??ber meine Games" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className={styles.main}>
                    <div className={styles.content}>
                        <h3 className={styles.headline}>Deine Games</h3>
                        <ListGroup as="ol">    
                            {props.Data.games.map((game: Game) => {
                                let gameCode = Buffer.from(game.id.toString()).toString('base64');

                                const getStatus = () => {
                                    console.log(game.winner);

                                    if(game.winner){
                                        return {color: 'success', text: "fertig"};
                                    }else{
                                        return {color: 'danger', text: "warte"};
                                    }
                                }

                                return(
                                    <Link href={`/games/view?id=${gameCode}`} key={game.id}>
                                        <ListGroup.Item
                                            as="li"
                                            className={`d-flex justify-content-between align-items-start ${styles.listItem}` }
                                            key={game.id}
                                        >
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">{game.shop} ({numberFormatter.format(game.sum)})</div>
                                                    <span>{new Date(parseInt(game.createdAt)).toLocaleDateString('de-DE')}</span>
                                            </div>
                                            <Badge bg={getStatus().color} pill>
                                                {getStatus().text}
                                            </Badge>
                                        </ListGroup.Item>
                                    </Link>
                                );
                            })}

                        </ListGroup>

                    </div>
                </main>
            </div>
            <ReducedNavbar active={"Games"}/>
        </>
  )
}

export default Games