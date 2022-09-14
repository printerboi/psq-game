import type { GetServerSideProps, NextPage } from 'next'
import 'bootstrap/dist/css/bootstrap.css';
import Cookies from 'cookies';



export const getServerSideProps: GetServerSideProps = async (ctx) => {
    //Get the context of the request
    const { req, res } = ctx
    //Get the cookies from the current request
    const {cookies} = req
    
    //Check if the login cookie is set
    if( !cookies.login ){
        //Redirect if the cookie is not set
        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/'} };
    }else{
        const currCookies = new Cookies(req, res);
        currCookies.set('login', "", {
            httpOnly: true,
            maxAge: 0 //Used for deletion
        });

        return { props: { InitialState: {}, Data: {} }, redirect: { permanent: false, destination: '/login'} };
    }

    return { props: { InitialState: {} } }
}

const Logout: NextPage = () => {
    return (<div></div>);
}

export default Logout