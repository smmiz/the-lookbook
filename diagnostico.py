import os
from pathlib import Path

# --- CONFIGURACIÓN ---
# La ruta raíz de tu proyecto. ¡No la cambies, ya está correcta!
ROOT_DIR = Path(r"C:\Users\alexa\Desktop\the-lookbook-main")

# Directorios y archivos que no necesitamos ver
IGNORE_LIST = ['.git', 'node_modules', '.next', '__pycache__', '.DS_Store']

def print_file_content(file_path):
    """Imprime el contenido de un archivo de texto de forma clara."""
    # Imprime una cabecera para saber de qué archivo se trata
    print(f"\n\n# {'='*10} INICIO DE: {file_path.relative_to(ROOT_DIR)} {'='*10}")
    try:
        # Intenta leer el archivo como texto
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        print(content)
    except Exception as e:
        # Si falla (por ejemplo, un Excel), solo informa que es binario
        print(f"[Archivo binario o ilegible. Tamaño: {file_path.stat().st_size} bytes. Error: {e}]")
    print(f"# {'='*10} FIN DE: {file_path.relative_to(ROOT_DIR)} {'='*10}")

def main():
    """Función principal para analizar el proyecto."""
    if not ROOT_DIR.is_dir():
        print(f"!!! ERROR: El directorio no existe -> {ROOT_DIR}")
        print("!!! Por favor, abre este script y asegúrate de que la ruta en la variable ROOT_DIR sea la correcta.")
        return

    print("="*60)
    print("INICIANDO ANÁLISIS COMPLETO DEL PROYECTO...")
    print(f"Directorio a analizar: {ROOT_DIR}")
    print("="*60)
    
    # Recorre todas las carpetas y archivos dentro del directorio raíz
    for root, dirs, files in os.walk(ROOT_DIR, topdown=True):
        # Evita entrar en las carpetas ignoradas
        dirs[:] = [d for d in dirs if d not in IGNORE_LIST]
        
        current_dir = Path(root)
        
        # Imprime el contenido de cada archivo
        for file_name in files:
            file_path = current_dir / file_name
            print_file_content(file_path)
            
    print("\n\n" + "="*60)
    print("ANÁLISIS COMPLETADO.")
    print("Por favor, copia TODO el texto de esta terminal, desde la primera")
    print("línea '=====' hasta aquí, y pégalo en nuestra conversación.")
    print("="*60)

if __name__ == "__main__":
    main()
