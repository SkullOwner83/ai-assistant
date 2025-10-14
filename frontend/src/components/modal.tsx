import { useEffect, useRef, useState } from "react";

interface Modal {
    isOpen: boolean,
    onClose?: () => void,
    children?: React.ReactNode
}

export const Modal: React.FC<Modal> = ({ isOpen, onClose, children }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [mouseDownOutside, setMouseDownOutside] = useState(false);

    useEffect(() => {
        const handleClose = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose?.();
            }
        }

        window.addEventListener("keydown", handleClose);
        return () => window.removeEventListener("keydown", handleClose);
    }, [isOpen, onClose]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
            setMouseDownOutside(true);
        } else {
            setMouseDownOutside(false);
        }
    };

    const handleMouseUp = () => {
        if (mouseDownOutside) {
            onClose?.();
        }
    };

    return (
        <div className={`Modal-Component ${isOpen ? "Visible" : "Hidden"}`} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div className="Modal-Content" onClick={(e) => {e.stopPropagation()}} ref={contentRef}>
                {children}
            </div>
        </div>
    );
}