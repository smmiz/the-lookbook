import os
from pathlib import Path

# --- CONFIGURACIÓN ---
# La ruta raíz de tu proyecto. ¡No la cambies, ya está correcta!
ROOT_DIR = Path(r"C:\Users\alexa\Desktop\the-lookbook-main")

# --- Contenido de los Archivos Correctos ---

# Contenido para restaurar pages/models/[slug].js
MODELS_SLUG_CONTENT = r"""
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

// Para esta página, los datos vienen del archivo `models.json` original
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'public/data/models.json');
  const jsonData = fs.readFileSync(filePath);
  const models = JSON.parse(jsonData);

  const paths = models.map((model) => ({
    params: { slug: model.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'public/data/models.json');
  const jsonData = fs.readFileSync(filePath);
  const models = JSON.parse(jsonData);

  const model = models.find((m) => m.slug === slug) || null;

  return {
    props: {
      model,
    },
  };
}
"""

# Contenido para crear pages/castings/[slug].js
CASTINGS_SLUG_CONTENT = r"""
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
"""

def main():
    """Ejecuta el proceso de limpieza y creación de archivos."""
    print("--- Iniciando reparación del proyecto ---")

    # 1. Definir rutas de los archivos
    incorrect_file_1 = ROOT_DIR / "pages" / "castings" / "castings.js"
    incorrect_file_2 = ROOT_DIR / "pages" / "castings" / "slug.js"
    
    models_slug_file = ROOT_DIR / "pages" / "models" / "[slug].js"
    castings_slug_file = ROOT_DIR / "pages" / "castings" / "[slug].js"

    # 2. Borrar archivos incorrectos
    for f in [incorrect_file_1, incorrect_file_2]:
        try:
            f.unlink()
            print(f"✅ Archivo incorrecto eliminado: {f}")
        except FileNotFoundError:
            print(f"☑️  Archivo no encontrado (probablemente ya fue eliminado): {f}")

    # 3. Restaurar/Crear archivos correctos
    try:
        # Restaurar el perfil de modelo
        models_slug_file.write_text(MODELS_SLUG_CONTENT.strip(), encoding='utf-8')
        print(f"✅ Archivo restaurado: {models_slug_file}")
        
        # Crear el archivo de casting
        castings_slug_file.write_text(CASTINGS_SLUG_CONTENT.strip(), encoding='utf-8')
        print(f"✅ Archivo de casting creado correctamente: {castings_slug_file}")
        
    except Exception as e:
        print(f"❌ ERROR al escribir los archivos: {e}")

    print("\n--- Reparación completada ---")
    print("¡La estructura de archivos ha sido corregida! Ahora puedes reiniciar tu servidor.")

if __name__ == "__main__":
    main()

