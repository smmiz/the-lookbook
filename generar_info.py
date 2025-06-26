# Archivo: generar_info_casting.py

import os
from pathlib import Path

# Este script necesita la librería 'openpyxl' para leer los Excel.
try:
    import openpyxl
except ImportError:
    print("Error: La librería 'openpyxl' es necesaria para este script.")
    print("Por favor, abre tu terminal y ejecuta el siguiente comando:")
    print("pip install openpyxl")
    exit()

# --- CONFIGURACIÓN ---

# La URL base de tu sitio en Netlify.
BASE_URL = "https://the-lookbook.netlify.app"

# El script asume que se ejecuta desde la carpeta raíz de tu proyecto.
ROOT_DIR = Path.cwd()

# El directorio donde guardas los archivos de Excel de los castings.
CASTINGS_DIR = ROOT_DIR / "castings"


def generate_info_file(excel_file_path):
    """
    Lee un archivo Excel de casting y crea un archivo .txt con el link y la contraseña.
    """
    try:
        # Carga el archivo de Excel para leer la contraseña
        workbook = openpyxl.load_workbook(excel_file_path)

        if "Config" not in workbook.sheetnames:
            print(f"  -> ⚠️  Advertencia: No se encontró la hoja 'Config' en {excel_file_path.name}. No se puede obtener la contraseña.")
            password = "NO ENCONTRADA"
        else:
            sheet = workbook["Config"]
            password = sheet['A1'].value if sheet['A1'] and sheet['A1'].value else "NO ESPECIFICADA"

        # Obtiene el 'slug' del casting a partir del nombre del archivo
        file_name_without_ext = excel_file_path.stem
        casting_slug = file_name_without_ext.replace('casting-', '')

        # Construye la URL completa del casting
        casting_url = f"{BASE_URL}/castings/{casting_slug}"

        # Define el contenido que se escribirá en el archivo de texto
        info_content = (
            f"Link al Casting: {casting_url}\n"
            f"Contraseña: {password}\n"
        )

        # Crea la ruta para el nuevo archivo .txt
        txt_file_path = excel_file_path.with_name(f"{file_name_without_ext}-info.txt")

        # Escribe el contenido en el archivo .txt
        txt_file_path.write_text(info_content, encoding='utf-8')
        
        print(f"  -> ✅ Archivo de información creado: '{txt_file_path.name}'")

    except Exception as e:
        print(f"  -> ❌ ERROR procesando el archivo {excel_file_path.name}: {e}")


def main():
    """Función principal que encuentra y procesa todos los archivos de casting."""
    print("--- Iniciando script para generar archivos de información de casting ---")

    if not CASTINGS_DIR.is_dir():
        print(f"❌ ERROR: No se encontró el directorio de castings en: {CASTINGS_DIR}")
        return

    print(f"Buscando archivos .xlsx en: {CASTINGS_DIR}\n")

    casting_files = list(CASTINGS_DIR.glob("casting-*.xlsx"))

    if not casting_files:
        print("No se encontraron archivos de casting para procesar.")
    else:
        for file_path in casting_files:
            print(f"Procesando: {file_path.name}")
            generate_info_file(file_path)

    print("\n--- Proceso completado ---")


if __name__ == "__main__":
    main()
