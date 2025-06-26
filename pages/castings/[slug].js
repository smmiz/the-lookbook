// Archivo: pages/castings/[slug].js

import dynamic from 'next/dynamic';
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useState } from 'react';
import ModelCard from '@/components/ModelCard';
import styles from '@/styles/Casting.module.css';

// --- Componente que se renderiza solo en el navegador ---
function CastingClientView({ casting }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (inputValue === casting.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <h1 className={styles.authTitle}>Casting Privado</h1>
          <p className={styles.authSubtitle}>Introduce la contraseña para ver la selección de modelos para el proyecto <strong>{casting.slug}</strong>.</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.authInput}
              placeholder="Contraseña"
            />
            <button type="submit" className={styles.authButton}>
              Acceder
            </button>
          </form>
          {error && <p className={styles.authError}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className={styles.castingTitle}>Casting para: {casting.slug}</h1>
      <div className={styles.gridContainer}>
        {casting.models.map((model, index) => (
          <ModelCard key={model.slug} model={model} index={index} />
        ))}
      </div>
    </>
  );
}

// --- Importación dinámica para evitar errores de hidratación ---
const DynamicCastingView = dynamic(() => Promise.resolve(CastingClientView), {
  ssr: false,
  loading: () => (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.authTitle}>Cargando Casting...</h1>
        <p className={styles.authSubtitle}>Por favor, espera.</p>
      </div>
    </div>
  )
});

// --- Componente principal de la página ---
export default function CastingPage({ casting }) {
  if (!casting) {
    return <div>Casting no encontrado.</div>;
  }

  return (
    <>
      <Head>
        <title>Casting: {casting.slug}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <DynamicCastingView casting={casting} />
    </>
  );
}

// --- Funciones para obtener datos en el servidor ---
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'public/data/data.json');
  try {
    const jsonData = fs.readFileSync(filePath);
    const data = JSON.parse(jsonData);
    const paths = data.castings.map((casting) => ({
      params: { slug: casting.slug },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.warn("data.json no encontrado al generar rutas de casting.")
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'public/data/data.json');
  const jsonData = fs.readFileSync(filePath);
  const data = JSON.parse(jsonData);
  const casting = data.castings.find((c) => c.slug === slug) || null;

  return {
    props: {
      casting,
    },
    revalidate: 600,
  };
}