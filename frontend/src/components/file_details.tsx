interface fileDetailsProps {
    file: File;
    onDelete?: () => void
}

export const FileDetails: React.FC<fileDetailsProps> = ({ file, onDelete }) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = bytes / Math.pow(k, i);
        return `${size.toFixed(2)} ${sizes[i]}`;
    }

    const extensionImage = (extension?: string): string => {
        let path = "";

        switch(extension) {
            case "txt": path = "txt-file.png"; break;
            case "pdf": path = "pdf-file.png"; break;
            case "docx": path = "doc-file.png"; break;
        }

        return path;
    }

    return (
        <div className="File-Container">
            <div className="Image-Container">
                <img src={extensionImage(extension)} alt="Formato del archivo" draggable={false}/>
            </div>

            <div className="File-information">
                <p>{file.name}</p>
                <p>{formatFileSize(file.size)}</p>
            </div>

            <button onClick={() => onDelete?.()}>
                <img src="Delete.png" alt="Eliminar archivo." draggable={false}/>
            </button>
        </div>
    )
}