import Image from 'next/image'
import Link from 'next/link';
import styles from '../styles/components/ReducedNavbar.module.css';
import Head from 'next/head';
import { useState } from 'react';
import { NextRouter } from 'next/router';


interface PropsData {
    router: NextRouter,
}

const ReducedNavbar = (props: PropsData) => {
    
    return (
        
        <div className={styles.container}>    
            <div className={styles.logoContainer}>
                <Link href="/">
                    <Image alt='PSQ Logo' src="/logo.png" className={styles.nav_icon} width={70} height={70} />
                </Link>
            </div>
        </div>
    );
}

export default ReducedNavbar;