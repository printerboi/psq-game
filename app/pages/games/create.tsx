import axios, { AxiosError, AxiosResponse } from 'axios'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
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

/**
 * Returns the last file extension present in the provided string
 *
 * @param {string} type the file extension
 * @return {string} Returns the last occurence of the file exentions present in the string
 */
 export function getFileExtension(type: string): string{
    let parsedType = type.substring(type.lastIndexOf('\/') + 1);

    return "." + parsedType;
}

/**
 * Test if a provided mime-type is allowed for a file upload
 *
 * @param {string} type The mime-type of a file
 * @return {boolean} Returns if the provided mime-type is allowed
 */
export function isTypeAllowed( type: string ): boolean {
    let isAllowed = false;

    switch(type){
        case('image/jpg'):
            isAllowed = true;
            break;
        case('image/jpeg'):
            isAllowed = true;
            break;
        case('image/gif'):
            isAllowed = true;
            break;
        case('image/apng'):
            isAllowed = true;
            break;
        case('image/png'):
            isAllowed = true;
            break;
        case('image/avif'):
            isAllowed = true;
            break;
        case('image/svg+xml'):
            isAllowed = true;
            break;
        case('image/webp'):
            isAllowed = true;
            break;
    }

    return isAllowed;
}

const allowdTypes = ['image/jpg', 'image/jpeg', 'image/gif', 'image/apng', 'image/png', 'image/webp']

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
    const [imageURLObject, setImageURLObject] = useState('');
    const [ errMsg, setErrMsg ] = useState("");
    const [ showError, setShowError ] = useState(false);
    const [showRemoveImageOverlay, setShowRemoveImageOverlay] = useState(false);
    const router = useRouter();

    const fileRef = useRef<HTMLInputElement>(null);

    const createGame = async () => {
         try{
            const res = await axios.post(`/api/game/`, newGame);

            console.log(fileRef);

            let fileList = fileRef.current?.files;

            console.log(fileList);

            let newId = res.data.message;

            if(fileList){
                if(fileList.length == 1){
                    let type = fileList[0].type;
                    if(isTypeAllowed(type)){
                        setShowError(false);

                        let oldFilename = fileList[0].name;
                        let typeEnding = "";

                        typeEnding = getFileExtension(type);
                        
                        let formData = new FormData();
                        formData.append("filesize", fileList[0].size.toString());
                        formData.append("watchImage", fileList[0] , fileList[0].name);


                        const config = {
                            headers: { 'content-type': 'multipart/form-data' },
                            onUploadProgress: (event: any) => {
                                console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
                            },
                        };
                    
                        try{
                            let response = await axios.post(`/api/game/upload/${newId}`, formData, config);                            

                        }catch(e){
                            //Show Error message something went wrong during upload...
                            setErrMsg("Etwas ist beim Hochladen des Bildes schiefgelaufen. Bittte versuchen Sie es später erneut");
                            setShowError(true);
                        }
                    
                    }else{
                        //Show Error message unsuported file type...
                        setErrMsg("Der Dateityp der Datei wird nicht unterstützt. Erlaube Dateitypen sind: .png .jpg .jpeg .gif .webp");
                        setShowError(true);
                    }
                
                }
            }


            router.push(`/games/view?id=${res.data.message}`);
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

    const uploadGameImage = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        console.log(e.target);

        const target = e.target as typeof e.target & {
            files: FileList
        };

        setImageURLObject(URL.createObjectURL(target.files[0]));
        setShowRemoveImageOverlay(true);
    }

    const resetImage = async () => {
        setImageURLObject("");
        setShowRemoveImageOverlay(false);
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
                        <div onClick={() => {resetImage()}} className={`${styles.removeImageOverlay} ${(showRemoveImageOverlay)? '': styles.hideRemoveImage}`}>
                            <i className='bx bx-x-circle' ></i>
                        </div>
                        <div className={styles.gameImage} onClick={() => {fileRef.current?.click();}}>
                            <Image src={imageURLObject} width={300} height={600} layout='intrinsic'/>
                        </div>

                        <Form.Control style={{display: 'none'}} accept={allowdTypes.toString()} ref={fileRef} name='image' type="file" onChange={(e) => {uploadGameImage(e)}}/>

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