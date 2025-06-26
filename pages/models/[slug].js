// Archivo: pages/models/[slug].js

import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Image from 'next/image';
import PortfolioGallery from '@/components/PortfolioGallery';
import styles from '@/styles/ModelProfile.module.css';

// Esta es la página que muestra el perfil PÚBLICO de un solo modelo.

export default function ModelProfile({ model }) {
  if (!model) {
    return <div>Modelo no encontrado.</div>;
  }
  
  const { name, lastName, nationality, height, bust, waist, hips, chest, shoeSize, hairColor, eyeColor, instagram, tiktok, portfolioImageUrls, coverImageUrl } = model;

  return (
    <>
      <Head>
        <title>{name} {lastName} | Perfil de Modelo</title>
        <meta name="description" content={`Portafolio y medidas de ${name} ${lastName}.`} />
      </Head>

      <div className={styles.profileContainer}>
        <div className={styles.mainInfo}>
            <div className={styles.coverImageWrapper}>
                <Image
                    src={coverImageUrl}
                    alt={`Foto de ${name} ${lastName}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>
            <div className={styles.details}>
                <h1 className={styles.name}>{name} {lastName}</h1>
                <p className={styles.nationality}>{nationality}</p>
                <h2 className={styles.sectionTitle}>Medidas</h2>
                <div className={styles.measurementsGrid}>
                    <span>Estatura</span> <span>{height} cm</span>
                    {chest && <><span>Pecho</span> <span>{chest} cm</span></>}
                    {bust && <><span>Busto</span> <span>{bust} cm</span></>}
                    <span>Cintura</span> <span>{waist} cm</span>
                    {hips && <><span>Cadera</span> <span>{hips} cm</span></>}
                    <span>Calzado</span> <span>{shoeSize}</span>
                    <span>Color de Cabello</span> <span>{hairColor}</span>
                    <span>Color de Ojos</span> <span>{eyeColor}</span>
                </div>
                <h2 className={styles.sectionTitle}>Redes Sociales</h2>
                <div className={styles.socialLinks}>
                    {instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
                    {tiktok && <a href={`https://tiktok.com/@${tiktok}`} target="_blank" rel="noopener noreferrer">TikTok</a>}
                </div>
            </div>
        </div>

        <div className={styles.portfolioSection}>
            <h2 className={styles.sectionTitle}>Portafolio</h2>
            <PortfolioGallery imageUrls={portfolioImageUrls} />
        </div>
      </div>
    </>
  );
}

// --- ARREGLO CLAVE: Ahora leemos del archivo correcto 'data.json' ---

export async function getStaticPaths() {
  // Leemos del nuevo archivo de datos consolidado.
  const filePath = path.join(process.cwd(), 'public/data/data.json');
  const jsonData = fs.readFileSync(filePath);
  const data = JSON.parse(jsonData);

  // Usamos la lista 'allModels' que está dentro de data.json.
  const paths = data.allModels.map((model) => ({
    params: { slug: model.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  // Leemos del nuevo archivo de datos consolidado.
  const filePath = path.join(process.cwd(), 'public/data/data.json');
  const jsonData = fs.readFileSync(filePath);
  const data = JSON.parse(jsonData);

  // Buscamos el modelo en la lista 'allModels'.
  const model = data.allModels.find((m) => m.slug === slug) || null;

  return {
    props: {
      model,
    },
  };
}
