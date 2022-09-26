import axios from 'axios'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import ReducedNavbar from '../components/reducedNavbar'
import Sidebar from '../components/sidebar'
import styles from '../styles/Home.module.css'
import { prisma } from '../db';
import { Game } from '@prisma/client'


//Define a type for the cookie
type User = {
  id: Number,
  username: String,
  email: String,
  roleid: Number,
  pointOffset: number,
}

interface InitialProps {
  InitialState: User;
  Data: PropsData;
}

interface PropsData {
  games: Array<WinResult>
}

type customUser = {
  id: number,
  username: string,
  pointOffset: number,
}

interface WinResult {
  user: customUser;
  count: number;
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

    let gamesWon = await prisma.game.groupBy({
          by: ['winnerId'],
          _count: {
            winnerId: true,
          },
          orderBy: {
            _count: {
              winnerId: 'desc',
            }
          },
      });

      let users = await prisma.user.findMany({
        select: {
          id: true,
          username:  true,
          pointOffset: true,
        },
      });

      let login = (cookies.login)? cookies.login: "";

      let winnerIdDict: Array<WinResult> = [];
      let usersWithPoints = new Set();

      gamesWon.map(async (agg) => {
        if(agg.winnerId){

          let fUser = users.find((u: customUser) => {
            if(u.id == agg.winnerId){
              return true;
            }
            return false;
          });

          usersWithPoints.add(fUser?.id);

          if(fUser && fUser.id != 1){
            winnerIdDict.push({
              user: fUser,
              count: agg._count.winnerId + fUser.pointOffset,
            });
          }
        }
      });

      users.map((u: customUser) => {
        if(!usersWithPoints.has(u.id) && u.id != 1){
          winnerIdDict.push({
            user: u,
            count: 0 + u.pointOffset,
          });
        }
      })

      winnerIdDict.sort((a: WinResult, b: WinResult) => {
        if(a.count < b.count){
          return 1;
        }
        if(a.count > b.count){
          return -1;
        }
        return 0;
      })

      return { props: { InitialState:  JSON.parse(Buffer.from(login, 'base64').toString('ascii')), Data: {games: winnerIdDict} } }
  }
}


const Home: NextPage<InitialProps> = ( props: InitialProps ) => {
  const [ wins, setWins ] = useState(0);

  const calcPoints = async () => {
    try{
      const res = await axios.get(`/api/wins/${props.InitialState.id}`);
      setWins(props.InitialState.pointOffset + parseInt(res.data.message));
    }catch(e: any){
      console.log(e);
    }
  }

  useEffect(() => {
    calcPoints();
  }, []);

  if(props.InitialState.roleid == 1){
    return (
      <div className={styles.container}>
        <Head>
          <title>Dashboard</title>
          <meta name="description" content="Dashboard der Anwendung" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>
          <Sidebar active={'Home'} roleId={props.InitialState.roleid}>
            <h3 className={styles.title}>
              Willkommen im P.S.Q Backend
            </h3>
  
  
            <div className={styles.grid}>
              
            </div>
            </Sidebar>
          </main>
      </div>
    )
  }else{
    return (
      <>
        <div className={styles.container}>
          <Head>
            <title>PSQ</title>
            <meta name="description" content="PSQ das Supermarktquizz für die ganze Familie" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
    
          <main className={styles.main}>
              <div className={styles.welcome}>
                <Image src="/logo.png" alt="PSQ Logo" width={100} height={100} />
                <h3 className={styles.title}>
                  Willkommen beim P.S.Q
                </h3>
              </div>

              <div className={styles.pointsCounter}>Deine aktuelle Punktzahl ist:<br/> <span className={styles.points}>{wins}</span></div>
    
              <Table responsive="sm" className={styles.rankTable}>
                <thead>
                  <tr>
                    <th>Platz</th>
                    <th>Spieler</th>
                    <th>Punktzahl</th>
                  </tr>
                </thead>
                <tbody>
                {props.Data.games.map((result: WinResult, index: number) => {
                  

                  const handlePoints = (p: number) => {
                    if(p == 0){
                      return "🦶"
                    }else{
                      return p.toString();
                    }
                  }

                  const handleRank = (r: number) => {
                    if(r == 1){
                      return "👑";
                    }else{
                      return r.toString();
                    }
                  }

                  const handleHighlightUsername = () => {
                    if(props.InitialState.id == result.user.id){
                      return (<b>{result.user.username}</b>);
                    }else{
                      return (<>{result.user.username}</>);
                    }
                  }

                  return (
                    <tr key={index}>
                      <td>{handleRank(index+1)}</td>
                      <td>{handleHighlightUsername()}</td>
                      <td>{handlePoints(result.count)}</td>
                    </tr>
                  )
                  })}
                </tbody>
              </Table>
            </main>
        </div>

        <ReducedNavbar active='Home'/>
      </>
    )
  }
}

export default Home