interface DragZoneprops{ 
    children: React.ReactNode;
    validFiles: Array<string>;
    onDropFile: (file: File) => void;
}

export const DragZone: React.FC<DragZoneprops> = ({ children, validFiles, onDropFile })  => {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const extension = file.type.split("/")[1];
            console.log(extension)

            if (validFiles.includes(extension)) {
                onDropFile(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }
            else {
                alert("Archivo no válido.");
            }
        }
    }
    
    return (
        <div 
            className="DragZone-Component"
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}>
                {children}
        </div>
    )
}
