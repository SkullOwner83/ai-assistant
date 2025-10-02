import { useRef, useState } from "react";

interface DragZoneprops{ 
    validFiles: Array<string>;
    onFileChanged?: (file: File | null) => void;
    onError?: (message: string) => void;
}

export const DragZone: React.FC<DragZoneprops> = ({ validFiles, onFileChanged, onError })  => {
    const [file, setFile] = useState<File | null>(null);
    const browserFileRef = useRef<HTMLInputElement | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const extension = file.name.split(".").pop()?.toLowerCase();

            if (extension && validFiles.includes(extension)) {
                setFile(e.dataTransfer.files[0]);
                onFileChanged?.(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }   
            else {
                onError?.("Archivo no válido.");
            }
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / Math.pow(k, i);
        return `${size.toFixed(2)} ${sizes[i]}`;
    }
    
    return (
        <div 
            className="Dragzone-Component"
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}>
                <div className="Drag-Area">
                    <img src="upload.png" alt="Subir imagen" draggable="false"/>
                    <h1>Elige o suelta un archivo</h1>
                    <p>Archivos soportados: TXT, PDF, DOCX.</p>
                    <p>Tamaño máximo: 500MB</p>
                    <label className="Upload-Button">
                        Buscar archivo
                        <input type="file" accept=".txt, .pdf" ref={browserFileRef} onChange={(e) => {
                            const uploadedFile = e.target.files?.[0]
                            const extension = uploadedFile?.name.split(".").pop()?.toLowerCase();

                    
                            if (uploadedFile && extension && validFiles.includes(extension)) {
                                setFile(uploadedFile);
                                onFileChanged?.(uploadedFile);
                            } else {
                                onError?.("Archivo no válido.");
                                e.target.value = "";
                            }
                        }}/>
                    </label>
                </div>

                {(file && (
                    <div className="File-Container">
                        <div className="Image-Container">
                            <img src="txt file.png" alt="Formato del archivo" draggable={false}/>
                        </div>

                        <div className="File-information">
                            <p>{file.name}</p>
                            <p>{formatFileSize(file.size)}</p>
                        </div>

                        <button onClick={() => {
                            if (browserFileRef.current) browserFileRef.current.value = "";
                            setFile(null);
                            onFileChanged?.(null);
                        }}>
                            <img src="Delete.png" alt="Eliminar archivo." draggable={false}/>
                        </button>
                    </div>
                ))}
        </div>
    )
}
