// scripts/build-data.js

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Constantes de Configuración ---
const MASTER_MODELS_PATH = path.join(process.cwd(), 'datos_modelos.xlsx');
const CASTINGS_DIR = path.join(process.cwd(), 'castings');
const OUTPUT_DATA_PATH = path.join(process.cwd(), 'public/data/data.json'); // Nuevo archivo de salida

// Configuración de Cloudinary (sin cambios)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


// --- Funciones de Ayuda (sin cambios) ---

function processSheet(sheet, gender) {
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  return jsonData.map(row => {
    const modelData = { gender, name: row['Nombre'], lastName: row['Apellido'], nationality: row['Nacionalidad'], instagram: row['Instagram'], tiktok: row['TikTok'], slug: row['slug'], hairColor: row['Color de Cabello'], eyeColor: row['Color de Ojos'], height: row['Estatura'], shoeSize: row['Talla de Zapato'] };
    if (gender === 'woman') {
      modelData.bust = row['Busto'];
      modelData.waist = row['Cintura'];
      modelData.hips = row['Cadera'];
    } else {
      modelData.chest = row['Pecho'];
      modelData.waist = row['Cintura'];
    }
    return modelData;
  });
}

async function getCloudinaryImages(slug) {
  try {
    const coverResult = await cloudinary.search.expression(`folder:models/${slug}/cover`).sort_by('public_id', 'desc').max_results(1).execute();
    const coverUrl = coverResult.resources[0]?.secure_url || null;
    const portfolioResult = await cloudinary.search.expression(`folder:models/${slug}/portfolio`).sort_by('public_id', 'asc').max_results(50).execute();
    const portfolioUrls = portfolioResult.resources.map(res => res.secure_url);
    return { coverUrl, portfolioUrls };
  } catch (error) {
    console.error(`Error fetching images for slug ${slug}:`, error);
    return { coverUrl: null, portfolioUrls: [] };
  }
}


// --- Lógica Principal del Script ---

async function buildData() {
  console.log('--- Iniciando la construcción de datos ---');

  // --- FASE 1: PROCESAR LA BASE DE DATOS MAESTRA DE MODELOS ---
  console.log('1/3 - Procesando base de datos maestra de modelos...');
  
  // Leemos el archivo local, ya no desde GitHub
  const masterWorkbook = xlsx.readFile(MASTER_MODELS_PATH);
  const womenSheet = masterWorkbook.Sheets['Mujeres'];
  const menSheet = masterWorkbook.Sheets['Hombres'];
  if (!womenSheet || !menSheet) throw new Error("El archivo maestro debe contener las hojas 'Mujeres' y 'Hombres'");

  let allModels = [...processSheet(womenSheet, 'woman'), ...processSheet(menSheet, 'man')];

  console.log('      -> Obteniendo imágenes de Cloudinary para todos los modelos...');
  const masterModelsList = [];
  for (const model of allModels) {
    if (!model.slug) continue;
    const { coverUrl, portfolioUrls } = await getCloudinaryImages(model.slug);
    masterModelsList.push({ ...model, coverImageUrl: coverUrl, portfolioImageUrls: portfolioUrls });
  }
  console.log(`      -> ${masterModelsList.length} modelos procesados.`);


  // --- FASE 2: PROCESAR LOS ARCHIVOS DE CASTING ---
  console.log('\n2/3 - Procesando proyectos de casting...');
  const castingFiles = fs.readdirSync(CASTINGS_DIR).filter(file => file.endsWith('.xlsx'));
  
  if (castingFiles.length === 0) {
      console.log('      -> No se encontraron archivos de casting. Saltando este paso.');
  }

  const castingsData = [];
  for (const fileName of castingFiles) {
    try {
      const castingSlug = fileName.replace('casting-', '').replace('.xlsx', '');
      console.log(`      -> Procesando casting: ${castingSlug}`);
      
      const workbook = xlsx.readFile(path.join(CASTINGS_DIR, fileName));
      
      // Leer los slugs de los modelos
      const modelsSheet = workbook.Sheets['Modelos'];
      const modelSlugsForCasting = xlsx.utils.sheet_to_json(modelsSheet, { header: 1 }).flat();

      // Leer la contraseña
      const configSheet = workbook.Sheets['Config'];
      const password = configSheet['A2'] ? configSheet['A2'].v : null;
      if (!password) {
          console.warn(`         (!) Advertencia: El casting '${castingSlug}' no tiene contraseña en la hoja 'Config', celda A1.`);
      }

      // Filtrar la lista maestra para obtener solo los modelos de este casting
      const modelsForCasting = masterModelsList.filter(model => modelSlugsForCasting.includes(model.slug));

      castingsData.push({
        slug: castingSlug,
        password: password,
        models: modelsForCasting,
      });

    } catch (error) {
        console.error(`      (!) Error procesando el archivo de casting ${fileName}:`, error.message);
    }
  }
  console.log(`      -> ${castingsData.length} castings procesados.`);


  // --- FASE 3: GUARDAR LOS DATOS COMBINADOS ---
  console.log('\n3/3 - Guardando datos combinados en public/data/data.json...');
  const finalData = {
    allModels: masterModelsList, // Mantenemos la lista completa por si la necesitamos
    castings: castingsData,      // Añadimos la nueva sección de castings
  };

  fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(finalData, null, 2));
  console.log('\n--- ¡Éxito! El archivo data.json ha sido generado. ---');
}

buildData().catch(error => {
  console.error('\n--- ¡ERROR FATAL DURANTE LA CONSTRUCCIÓN DE DATOS! ---');
  console.error(error.message);
  process.exit(1);
});
