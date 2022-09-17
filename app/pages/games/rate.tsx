import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Modal from 'react-bootstrap/Modal';
import Image from 'next/image';
import { Alert, Button, Form, InputGroup, Table } from 'react-bootstrap'
import styles from '../../styles/GameRate.module.css'
import { prisma } from '../../db';
import { useEffect, useState } from 'react'
import axios from 'axios';
import { useRouter } from 'next/router';
import ReducedNavbar from '../../components/reducedNavbar';

//Define a type for the cookie
type User = {
    id: number,
    username: string,
    email: string,
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

interface InitialProps {
  InitialState: User;
  id: number;
  Game: Game;
}



export const getServerSideProps: GetServerSideProps = async (ctx) => {
  //Get the context of the request
  const { req, res } = ctx
  //Get the cookies from the current request
  const {cookies} = req
  
  //Check if the login cookie is set
  if( !cookies.login ){
        //Redirect if the cookie is not set
        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/login'} };
  }else{

        let login = (cookies.login)? cookies.login: "";
        const state: User = JSON.parse(Buffer.from(login, 'base64').toString('ascii'));  

        if(state.roleid != 1){
            let id = null;
            let game = null;

            if( ctx.query.id ){
                id = ctx.query.id as string;
            }

            
            if( id ){

                let gameCode = parseInt(Buffer.from(ctx.query.id as string, 'base64').toString('ascii'));

                if(gameCode && !isNaN(gameCode)){
                    game = await prisma.game.findFirst({
                        where: {
                            id: gameCode
                        },
                        include: {
                            ratings: {
                                include: {
                                    createdBy: true,
                                }
                            },
                            winner: true,
                        }
                    });

                    console.log(state);

                    if(state.id != game?.createdById){
                        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };   
                    }

                }else{
                    return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };
                }
            }

            return { props: { InitialState: state, id: id, Game: game } };
        }else{
            return { props: { InitialState: {}, id: -1, User: {}, Categories: {}, Grades: {}, Years : {}, Education: {}, Options: {}, Rating: {} }, redirect: { permanent: false, destination: '/login'} };
        }
    }
}


const GameRate: NextPage<InitialProps> = ( props: InitialProps ) => {

    const [ gamecode, setGamecode ] = useState("");
    const [ errMsg, setErrMsg ] = useState("");
    const [ showError, setShowError ] = useState(false);
    const router = useRouter();

    const joinGame = async () => {

        try{
            let game = await axios.get(`/api/game/${gamecode}`);         

            if(game.data.message.createdById != props.InitialState.id){
                router.replace(`/games/rate/${gamecode}`);
            }else{
                setShowError(true);
                setErrMsg("Das ist dein eigenes Spiel! Dafür kannst du nicht abstimmen :P");
            }
        }catch(e: any){
            console.log(e);

            if(e.response.status == 404){
                setShowError(true);
                setErrMsg("Das Spiel konnte leider nicht gefunden werden :(");
            }else{
                setShowError(true);
                setErrMsg("Etwas hat nicht geklappt! Bitte versuche es nochmal.");
            }
        }

        
    }

    return (
        <>
            <ReducedNavbar active={"Rate"}/>
            <div className={styles.container}>
                <Head>
                    <title>Einem Spiel beitreten</title>
                    <meta name="description" content="Bewertung der Mitarbeiter" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className={styles.main}>
                    <h3 className={styles.rateHeadline}>Einem Spiel beitreten:</h3>

                    <div className={styles.joinInput}>
                        <InputGroup className="mb-3">
                            <Form.Control
                            placeholder="Gamecode"
                            aria-label="Gamecode"
                            aria-describedby="gamecode"
                            defaultValue={gamecode}
                            onChange={(e) => {
                                setShowError(false);
                                setGamecode(e.target.value);
                            }}
                            />
                            <Button variant="outline-secondary" id="button-addon2" onClick={joinGame}>
                                &rarr;
                            </Button>
                        </InputGroup>
                    </div>

                    <Alert variant={'danger'} show={showError}>
                        {errMsg}
                    </Alert>

                </main>
            </div>
        </>
    );

    
}

export default GameRate