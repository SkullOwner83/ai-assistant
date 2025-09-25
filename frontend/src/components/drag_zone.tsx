interface DragZoneprops{ 
    validFiles: Array<string>;
    onFileChanged?: (file: File) => void;
    onError?: (message: string) => void;
}

export const DragZone: React.FC<DragZoneprops> = ({ validFiles, onFileChanged, onError })  => {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const extension = file.type.split("/")[1];

            if (validFiles.includes(extension)) {
                onFileChanged?.(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }   
            else {
                onError?.("Archivo no válido.");
            }
        }
    }
    
    return (
        <div 
            className="Dragzone-Component"
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}>
                <img src="upload.png" alt="Subir imagen" draggable="false"/>
                <h1>Elige o suelta un archivo</h1>
                <p>Archivos soportados: TXT, PDF.</p>
                <p>Tamaño máximo: 16MB</p>
                <label className="Upload-Button">
                    Buscar archivo
                    <input type="file" accept=".txt, .pdf" onChange={(e) => {
                        const file = e.target.files?.[0];
                        const extension = file?.type.split("/")[1];
                    
                        if (file && extension && validFiles.includes(extension)) {
                            onFileChanged?.(file);
                        } else {
                            onError?.("Archivo no válido.");
                            e.target.value = "";
                        }
                    }}/>
                </label>
        </div>
    )
}
