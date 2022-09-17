import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Modal from 'react-bootstrap/Modal';
import Image from 'next/image';
import { Alert, Button, Form, InputGroup, Table } from 'react-bootstrap'
import styles from '../../styles/GameView.module.css'
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

                    console.log(game);


                    if(game){
                        if(state.id != game?.createdById){
                            return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };   
                        }
                    }else{
                        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/games/'} };
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


const GameView: NextPage<InitialProps> = ( props: InitialProps ) => {

    const numberFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });
    const gamePrice = numberFormatter.format(props.Game.sum);

    const [ game, setGame ] = useState(props.Game);
    const [ showCopy, setShowCopy ] = useState(false);
    const router = useRouter();

    const refreshData = () => {
        router.replace(router.asPath);
    }

    const refreshGame = async () => {
        try{
            const res = await axios.get(`/api/game/${game.id}`);
            setGame(res.data.message);
        }catch(e: any){
            //router.replace('/');
        }
    }

    setInterval(async () => {
        console.log('Refreshing...');

        await refreshGame();

    }, 60000);

    const calcWinner = async () => {
        let diffs: Array<number> = [];
        let soll = game.sum;

        console.log(game);

        game.ratings.map((rating: Rating, index: number) => {
            diffs[index] = Math.abs(soll - rating.value);
        });

        let winVal = Math.min(...diffs);
        let winnerIndex = diffs.indexOf(winVal);

        if(winnerIndex != -1){
            const winner = game.ratings[winnerIndex].createdBy;

            try{
                const res = await axios.put(`/api/game/${game.id}`, {winnerId: winner.id});

                await refreshGame();
            }catch(e: any){
                console.log("Das hat leider nicht geklappt....");
            }
        }else{
            console.log("No minimum found");
        }

        refreshData();
    }

    const copyLink = () => {
        console.log(router.basePath);
        navigator.clipboard.writeText(`${window.location.hostname}/games/rate/${props.id}`);
        setShowCopy(true);
    }

    setInterval(() => {
        if(showCopy){
            setShowCopy(false);
        }
    }, 60000);

    const getVisible = () => {
        if(showCopy){
            return styles.showCopy;
        }else{
            return styles.hideCopy;
        }
    }

    console.log(props.Game);

    if(props.Game.winner){
        return (
            <>
            <ReducedNavbar active={"Games"} />
            <div className={styles.container}>
                <Head>
                    <title>Ergebnisse für Game</title>
                    <meta name="description" content="Bewertung der Mitarbeiter" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
   
                <main className={styles.main}>
                    <h3 className={styles.viewHeadline}>{props.InitialState.username}<br/>Einkauf bei {props.Game.shop}</h3>
    
                    <div className={styles.gameImage}>
                        <Image src={`/uploads/${props.id}.png`} width={300} height={600} layout='intrinsic'/>
                    </div>
    
                    <div className={styles.gamePrice}>
                        <h3>{gamePrice}</h3>
                    </div>
    
                    <div className={styles.winnerMessage}>
                        <h3>Der Gewinner ist {props.Game.winner.username}</h3>
                        <div className={styles.winnerEmoji}>🎉</div>
                    </div>

    
                </main>
            </div>
        </>
        );
    }else{
        return (
            <>
                <ReducedNavbar active={"Games"} />
                <div className={styles.container}>
                    <Head>
                        <title>Ergebnisse für Game</title>
                        <meta name="description" content="Bewertung der Mitarbeiter" />
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
        
                    <main className={styles.main}>
                        <h3 className={styles.viewHeadline}>{props.InitialState.username}<br/>Einkauf bei {props.Game.shop}</h3>
        
                        <div className={styles.gameImage}>
                            <Image src={`/uploads/${props.id}.png`} width={300} height={600} layout='intrinsic'/>
                        </div>

        
                        <div className={styles.gamePrice}>
                            <h3>{gamePrice}</h3>
                        </div>
        
                        <div className={styles.gameResultContainer}>
                            <Table className={styles.ratingTable} striped>
                                <thead>
                                    <tr>
                                    <th>User</th>
                                    <th>Schätzung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        props.Game.ratings.map((rating: Rating, index: number) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{rating.createdBy.username}</td>
                                                    <td>{numberFormatter.format(rating.value)}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                    
                                </tbody>
                            </Table>
        
                            <div className={styles.gameButtonContainer}>
                                <Button variant='danger' onClick={calcWinner}>Abstimmung schließen</Button>
                            </div>

                            <div className={styles.shareInformation}>
                                <div className={styles.shareInformationText}>
                                    Der Code des Games lautet <span className={styles.gameCode}>{props.id}</span> Teile diesen Code mit deinen Spielern oder klicke auf "Einladung kopieren" um einen Link für das Game zu erhalten, über den deine Spieler beitreten können! Happy Guessing
                                </div>
                                <div className={`${styles.copyText} ${getVisible()}` }>kopiert!</div>
                                <Button className={styles.copyInvitation} variant='primary' onClick={copyLink}>Einladung kopieren</Button>
                            </div>
                        </div>
        
                    </main>
                </div>
            </>
        );
    }
}

export default GameView