import type { NextPage } from 'next'
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.css';
import styles from '../styles/Account.module.css';
import { GetServerSideProps } from 'next'
import React, { useState } from 'react';
import { PrismaClient, User } from '@prisma/client';
import { Modal, Button, InputGroup, FormControl, Form, Badge, ListGroup, Accordion, Alert } from 'react-bootstrap';
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

type CookieUser = {
    id: number,
    username: String,
    email: String,
    roleid: number
}

//Define a type for the Data of the NextJS Page props
type PropsData = {
    user: User,
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
    const state: CookieUser = JSON.parse(Buffer.from(login, 'base64').toString('ascii')); 

    let user = await prisma.user.findFirst({
        where: {
            id: {
                equals: state.id,
            }
        }
    });

    return { props: { InitialState: state, Data: {user: user} } }
}



const Account: NextPage<InitialProps> = ( props: InitialProps ) => {
    const [ newPassword, setNewPassword ] = useState("");
    const [ repeatedPassword, setRepeatetPassword ] = useState("");
    const [ errMsg, setErrMsg ] = useState("");
    const [ errVariant, setErrVariant ] = useState("danger");
    const [ showError, setShowError ] = useState(false);

    const testPassword = (pw: string) => {
        let t = "^(?=.*([a-zA-Z]))(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})";
        let regExp = new RegExp(t);
        return regExp.test(pw);
    }

    const activateError = (msg: string) => {
        setErrVariant('danger');
        setShowError(true);
        setErrMsg(msg);
    }

    const updatePassword = async () => {
        if(newPassword == repeatedPassword){
            if(testPassword(newPassword)){
                try {
                    let u = axios.put(`/api/users/${props.InitialState.id}`, { password: newPassword });

                    setErrVariant('success');
                    setShowError(true);
                    setErrMsg("Passwort erfolgreich ge??ndert!");
                }catch(e: any){
                    activateError("Das hat leider nicht geklappt versuche es sp??ter erneut!");
                }
            }else{
                activateError("Das Passwort ist zu schwach. Es muss alle Anforderungen erf??llen!");
            }
        }else{
            activateError("Die Passw??rter stimmen nicht ??berein!");
        }

        setNewPassword("");
        setRepeatetPassword("");
    }

    return (
        <>
            <div className={styles.container}>
                <Head>
                    <title>Account</title>
                    <meta name="description" content="PSQ Mein Account" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className={styles.main}>
                    <h3 className={styles.headline}>Mein Account</h3>
                    <div className={styles.content}>

                        <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Passwort ??ndern</Accordion.Header>
                                    <Accordion.Body>
                                        <div className={styles.changePasswordContainer}>
                                            <Form.Label htmlFor="passwordnew">Neues Passwort</Form.Label>
                                            <Form.Control
                                                type="password"
                                                id="passwordnew"
                                                aria-describedby="passwordHelpBlockNew"
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setErrVariant('danger');
                                                    setShowError(false);
                                                    setNewPassword(e.target.value)
                                                }}
                                            />
                                            <Form.Text id="passwordHelpBlock" muted>
                                                Das Passwort sollte min. 8 Zeichen lang sein, Sonderzeichen und Zahlen beeinhalten!
                                            </Form.Text>

                                            <div className={styles.passwordspacer}></div>

                                            <Form.Label htmlFor="passwordnew">Passwort wiederholen</Form.Label>
                                            <Form.Control
                                                type="password"
                                                id="passwordrepeat"
                                                aria-describedby="passwordHelpBlockReapeat"
                                                value={repeatedPassword}
                                                onChange={(e) => {
                                                    setErrVariant('danger');
                                                    setShowError(false);
                                                    setRepeatetPassword(e.target.value);                                            
                                                }}
                                            />

                                            <Alert variant={errVariant} show={showError} className={styles.passwordError}>
                                                {errMsg}
                                            </Alert>

                                            <Button variant={'success'} onClick={updatePassword} className={styles.passwordChangeButton}>Passwort ??ndern</Button>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                        </Accordion>
                        
                        <Link href={'/logout'}>
                            <Button variant='danger' className={styles.logoutbutton}>Ausloggen</Button>
                        </Link>

                    </div>
                </main>
            </div>
            <ReducedNavbar active={"Account"}/>
        </>
  )
}

export default Account