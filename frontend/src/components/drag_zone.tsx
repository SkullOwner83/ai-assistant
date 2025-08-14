import React, { useState } from 'react'

export const DragZone = ()  => {
    const [file, setFile] = useState<File | null>(null);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }

        alert(file)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    return (
        <div 
            className="DragZone-Component"
            onDragOver={handleDragOver} 
            onDrop={handleDrop}>
            drag_zone
        </div>
    )
}
