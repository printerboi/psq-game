import axios, { AxiosError, AxiosResponse } from 'axios'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Alert, Button, Form, InputGroup } from 'react-bootstrap'
import ReducedNavbar from '../../components/reducedNavbar'
import styles from '../../styles/CreateGame.module.css'

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
  }else{
      let login = (cookies.login)? cookies.login: "";
      return { props: { InitialState:  JSON.parse(Buffer.from(login, 'base64').toString('ascii')) } }
  }
}


const CreateGame: NextPage<InitialProps> = ( props: InitialProps ) => {
    const initalGame = {
        createdBy: props.InitialState.id,
        shop: "",
        sum: 0.00,
    }
    
    const [ newGame, setNewGame ] = useState(initalGame);
    const [ errMsg, setErrMsg ] = useState("");
    const [ showError, setShowError ] = useState(false);
    const router = useRouter();

    const createGame = async () => {
         try{
            const res = await axios.post(`/api/game/`, newGame);

            router.push(`/games/view?id=${res.data.message}`)
         }catch(e: any){

            if(e.response.status == 400){
                setErrMsg("Das hat leider nicht funktioniert. Bitte probiere es erneut!");
            }

            setShowError(true);
            setNewGame(initalGame);
            setErrMsg("");
            setShowError(false);
         }
    }

    return (
        <>
            <div className={styles.container}>
                <Head>
                    <title>Dashboard</title>
                    <meta name="description" content="Dashboard der Anwendung" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
            
                <main className={styles.main}>
                    <h2 className={styles.title}>
                        Ein neues Game erstellen
                    </h2>
            
                    <div className={styles.gameForm}>
                        <div className={styles.gameImage}>
                            Placeholder
                        </div>

                        <InputGroup className="mb-3">
                            <InputGroup.Text id="shop">Laden</InputGroup.Text>
                            <Form.Control
                                placeholder="Laden wo die Einkäufe gekauft wurden"
                                aria-label="shop"
                                aria-describedby="shop"
                                defaultValue={newGame.shop}
                                onChange={(e) => {
                                    setShowError(false);
                                    setNewGame({...newGame, shop: e.target.value});
                                }}
                            />
                        </InputGroup>

                        <InputGroup className="mb-3">
                            <InputGroup.Text id="sum">Summe</InputGroup.Text>
                            <Form.Control
                                type="number"
                                placeholder="0.00"
                                aria-label="shop"
                                aria-describedby="shop"
                                value={newGame.sum}
                                onChange={(e) => {
                                    setShowError(false);
                                    setNewGame({...newGame, sum: parseFloat(e.target.value)});
                                }}
                            />
                        </InputGroup>
                    </div>
                
                    <Alert variant={'danger'} show={showError}>
                        {errMsg}
                    </Alert>

                    <Button variant='success' onClick={createGame}>Game erstellen</Button>

                </main>
            </div>
            <ReducedNavbar active='CreateGame'/>
        </>
    );
}

export default CreateGame