import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import styles from '../../../styles/Rate.module.css'
import { prisma } from '../../../db';
import { useEffect, useState } from 'react'
import Image from 'next/image';
import axios from 'axios';
import ReducedNavbar from '../../../components/reducedNavbar';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { useRouter } from 'next/router';

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
                            createdBy: true,
                            winner: true,
                        }
                    });


                    if(!game){
                        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} }; 
                    }else{
                        if(game.createdById == state.id){
                            return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };
                        }
                    }
                }else{
                    return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };
                }
            }

            console.log(game);

            return { props: { InitialState: state, id: id, Game: game } };
        }else{
            return { props: { InitialState: {}, id: -1, User: {}, Categories: {}, Grades: {}, Years : {}, Education: {}, Options: {}, Rating: {} }, redirect: { permanent: false, destination: '/login'} };
        }
    }
}


const Rate: NextPage<InitialProps> = ( props: InitialProps ) => {

    const [ game, setGame ] = useState(props.Game);
    const [ rating, setRating ] = useState(0.00);
    const [ errMsg, setErrMsg ] = useState("");
    const [ showError, setShowError ] = useState(false);
    const router = useRouter();

    const refreshData = () => {
        router.replace(router.asPath);
    }

    const placeRating = (async () => {
        try{
            let nRating = await axios.post(`/api/rate/${game.id}`, {value: rating});
            let gameFromDB = await axios.get(`/api/game/${props.id}`);

            setGame(gameFromDB.data.message);

        }catch(e: any){
            console.log(e.response);
            if(e.response.data.errorcode == 5){
                setShowError(true);
                setErrMsg("Du hast bereits für dieses Game abgestimmt! Ein mehrmaliges Abstimmen ist verboten.");
            }else if(e.response.data.errorcode == 4){
                setShowError(true);
                setErrMsg("Die eingegebene Zahl ist fehlerhaft!");
            }
        }

        refreshData();
    });

    const hasUserRated = () => {
        let ratings = game.ratings;
        let found = -1;

        ratings.forEach((rating: Rating, index: number) => {
            if(rating.createdBy.id == props.InitialState.id){
                found = index;
            }
        });

        return found != -1;
    }

    const getWinner = () => {
        let winner = game.winner;

        if(winner){
            return winner.username
        }else{
            return "noch nicht entschieden";
        }
    }

    const getMock = () => {
        if(props.Game.winner){
            if(props.Game.winner.id == props.InitialState.id){
                return "🥳";
            }else{
                return "😢";
            }
        }else{
            return "🕧";
        }
    }

    if(hasUserRated()){
        return (
            <>
                <ReducedNavbar active={"Rate"}/>
                <div className={styles.container}>
                    <Head>
                        <title>{`Game ${props.id}`}</title>
                        <meta name="description" content={`PSQ Game ${props.id}`} />
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
        
                    <main className={styles.main}>
                        <h3 className={styles.rateHeadline}>Einkauf von {props.Game.createdBy.username}</h3>
        
                        <div className={styles.gameImage}>
                            <Image alt="Bild des Einkaufs" src={`/api/image-endpoint/${props.id}.png`} width={300} height={600} layout={'fill'} objectFit={'contain'}/>
                        </div>

                        <div className={styles.result}>
                            <h4>Vielen Dank für deine Abstimmung!</h4>
                            <div className={styles.resultText}>Der Sieger der Runde lautet:<br/><span className={styles.winnerName}>{getWinner()}</span></div>
                            <div className={styles.mock}>{getMock()}</div>
                        </div>
        
                    </main>
                </div>
            </>
        );
    }else{
        return (
            <>
                <ReducedNavbar active={"Rate"}/>
                <div className={styles.container}>
                    <Head>
                        <title>{`Game ${props.id}`}</title>
                        <meta name="description" content="PSQ Gib jetzt deine Bewertung ab" />
                        <link rel="icon" href="/favicon.ico" />
                        <meta property="og:title" content={`Einkauf ${props.id} von ${props.InitialState.username}`} />
                        <meta property="og:type" content="website" />
                        <meta property="og:url" content={`https://psq.maximiliankrebs.com/games/rate/${props.id}`} />
                        <meta property="og:image" content={`https://psq.maximiliankrebs.com/uploads/${props.id}.png`} />
                    </Head>
        
                    <main className={styles.main}>
                        <div className={styles.gameCode}>#{props.id}</div>
                        <h3 className={styles.rateHeadline}>Einkauf von {props.Game.createdBy.username} bei {props.Game.shop}</h3>
        
                        <div className={styles.gameImage}>
                            <Image alt="Bild des Einkaufs" src={`/api/image-endpoint/${props.id}.png`} width={300} height={600} layout={'fill'} objectFit={'contain'}/>
                        </div>
        
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder="Deine Schätzung..."
                                type='number'
                                aria-label="rating"
                                aria-describedby="rating"
                                value={rating}
                                onChange={(e) => {
                                    setShowError(false);
                                    setRating(parseFloat(e.target.value));
                                }}
                            />
                        </InputGroup>
        
                        <Alert variant={'danger'} show={showError}>
                            {errMsg}
                        </Alert>
        
                        <Button className={styles.rateButton} variant='success' onClick={placeRating}>Schätzung absenden</Button>
                    </main>
                </div>
            </>
        );
    }
}

export default Rate