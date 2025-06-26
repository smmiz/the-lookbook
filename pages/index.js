// pages/index.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

export default function HomePage() {
  const [animationStep, setAnimationStep] = useState(0);

  // Orquestador de la animación
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setAnimationStep(3), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <>
      <Head>
        <title>IZACCES - Plataforma de Casting Exclusiva</title>
        <meta name="description" content="La herramienta de presentación de talento exclusiva de IZ Management." />
      </Head>
      
      <div className={styles.heroContainer}>
        <div className={styles.logoContainer}>
          <span className={`${styles.logoPart} ${animationStep >= 1 ? styles.visible : ''}`}>
            IZ
          </span>
          <span className={`${styles.logoPart} ${styles.acces} ${animationStep >= 2 ? styles.visible : ''}`}>
            ACCES
          </span>
        </div>

        <div className={`${styles.detailsContainer} ${animationStep >= 3 ? styles.visible : ''}`}>
          <p className={styles.description}>
            La herramienta de presentación de talento exclusiva de IZ Management.
          </p>
          {/* El botón CTA ha sido eliminado. */}
        </div>
      </div>
    </>
  );
}
