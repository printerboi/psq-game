import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import styles from '../styles/Login.module.css';
import axios from 'axios';
import { useState } from 'react';
import { NextRouter, Router, useRouter } from 'next/router'

let errClass = styles.hideError;

const loginUser = async (event: React.SyntheticEvent, setErrClass: Function, setErrMsg: Function, router: NextRouter) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
        username: { value: string };
        password: { value: string };
    };

    axios.post('/api/login', {
        username: target.username.value,
        password: target.password.value
    })
      .then(function (response) {

        setErrClass(styles.hideError);

        // Make sure we're in the browser
        if (typeof window !== 'undefined') {
            router.push('/');
            return; 
        }

    })
      .catch(function (error) {

        setErrClass("alert alert-danger");
        setErrMsg(error.response.data.message);
    });
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    //Get the context of the request
    const { req, res } = ctx
    //Get the cookies from the current request
    const {cookies} = req
    
    //Check if the login cookie is set
    if( cookies.login ){
        //Redirect if the cookie is not set
        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/login'} };
    }

    return { props: { InitialState: {} } }
}

const Login: NextPage = () => {
    const [ errClass, setErrClass ] = useState(styles.hideError);
    const [ errMsg, setErrMsg ] = useState("");
    const router = useRouter()

    return (
        <div className={styles.container}>
        <Head>
            <title>Login</title>
            <meta name="description" content="PSQ Login" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>

            <div className={styles.logorow}>
                <Image src="/logo.png" alt="Logo" width={200} height={200} />
            </div>

            <div className={styles.formrow}>
                <form onSubmit={(event) => {
                    loginUser(event, setErrClass, setErrMsg, router);
                }}>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input id="username" className="form-control" name="username" type="text" autoComplete="username" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input id="password" className="form-control" name="password" type="password" required />
                    </div>

                    <div className={errClass} role="alert">
                        {errMsg}
                    </div>

                    <button className={"btn btn-primary " + styles.loginButton} type="submit">Login</button>
                </form>
            </div>

        </main>
        </div>
  )
}

export default Login