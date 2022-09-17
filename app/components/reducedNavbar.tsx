import Image from 'next/image'
import Link from 'next/link';
import styles from '../styles/components/ReducedNavbar.module.css';
import Head from 'next/head';
import { useState } from 'react';
import { NextRouter } from 'next/router';

interface linkElement {
    icon: string,
    activeCheck: string,
    link: string,
    text: string
}

interface PropsData {
    active: String,
}


let playerLinks = [
    {
        icon: 'bx-home',
        activeCheck: 'Home',
        link: '/',
        text: 'Home',
    },
    {
        icon: 'bxs-plus-square',
        activeCheck: 'CreateGame',
        link: '/games/create',
        text: 'Erstellen',
    },
    {
        icon: 'bxs-game',
        activeCheck: 'Games',
        link: '/games',
        text: 'Games',
    },
    {
        icon: 'bxs-star',
        activeCheck: 'Rate',
        link: '/games/rate',
        text: 'Bewerten',
    },
    {
        icon: 'bxs-user-circle',
        activeCheck: 'Account',
        link: '/account',
        text: 'Account',
    }
];


const ReducedNavbar = (props: PropsData) => {
    let activeElement = props.active;

    const getLinks = () => {

        let elementsContent = playerLinks.map((element: linkElement, key: number) => {
            let isElementActive = (activeElement == element.activeCheck)? styles.active: "";
            let isIconActive = (activeElement == element.activeCheck)? styles.activeicon: "";
            
            return (
                <div className={styles.LinkElement} key={key}>
                    <Link href={element.link} key={key} shallow={false}>
                        <div className={styles.nav_link + " " + isElementActive}> 
                            <i className={`bx ${element.icon} ${styles.nav_icon} ${isIconActive}`}></i>
                            <span className={styles.nav_name}>{element.text}</span> 
                        </div> 
                    </Link>
                </div>
            );
        });
        

        return elementsContent;
    }

    return (
        
        <div className={styles.container}>    
            {getLinks()}
        </div>
    );
}

export default ReducedNavbar;