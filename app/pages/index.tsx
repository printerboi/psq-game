import axios from 'axios'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ReducedNavbar from '../components/reducedNavbar'
import Sidebar from '../components/sidebar'
import styles from '../styles/Home.module.css'

//Define a type for the cookie
type User = {
  id: Number,
  username: String,
  email: String,
  roleid: Number
}

interface InitialProps {
  InitialState: User;
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


      return { props: { InitialState: {} } }
  }else{
      let login = (cookies.login)? cookies.login: "";
      return { props: { InitialState:  JSON.parse(Buffer.from(login, 'base64').toString('ascii')) } }
  }
}


const Home: NextPage<InitialProps> = ( props: InitialProps ) => {
  const [ wins, setWins ] = useState(0);

  const calcPoints = async () => {
    try{
      const res = await axios.get(`/api/wins/${props.InitialState.id}`);
      setWins(res.data.message);
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
            <title>Spiel erstellen</title>
            <meta name="description" content="Dashboard der Anwendung" />
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
    
              <div className={styles.grid}>
                
              </div>
            </main>
        </div>

        <ReducedNavbar active='Home'/>
      </>
    )
  }
}

export default Home