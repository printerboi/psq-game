import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Sidebar from '../components/sidebar'
import styles from '../styles/Home.module.css'

//Define a type for the cookie
type User = {
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
      <div className={styles.container}>
        <Head>
          <title>Spiel erstellen</title>
          <meta name="description" content="Dashboard der Anwendung" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>
            <h3 className={styles.title}>
              Willkommen beim P.S.Q
            </h3>
  
  
            <div className={styles.grid}>
              <a href="/games/create" className={styles.card} target="_blank">
                <h2>Spiel starten &rarr;</h2>
                <p>Ein neues PSQ starten</p>
              </a>

              <a href="/games" className={styles.card} target="_blank">
                <h2>Meine Games &rarr;</h2>
                <p>Meine PSQs ansehen</p>
              </a>

              <a href="/games/join" className={styles.card} target="_blank">
                <h2>Bewerten &rarr;</h2>
                <p>Einen PSQ bewerten</p>
              </a>
            </div>
          </main>
      </div>
    )
  }
}

export default Home