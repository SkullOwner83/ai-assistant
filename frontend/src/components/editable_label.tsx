import { useEffect, useRef, useState } from "react";

interface EditableLabel {
    children: string,
    isEditable: boolean,
    onTextChanged?: (newText: string) => void
}

export const EditableLabel: React.FC<EditableLabel> = ({ children, isEditable, onTextChanged }) => {
    const [editable, setEditable] = useState<boolean>(false);
    const textBoxRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => { setEditable(isEditable); }, [isEditable]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editable && textBoxRef.current && !textBoxRef.current.contains(e.target as Node)) {
                setEditable(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [editable]);

    useEffect(() => {
        if (editable && textBoxRef.current) {
            textBoxRef.current.value = children;
            textBoxRef.current.focus();
            textBoxRef.current.select();
        }
    }, [editable, children]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const newText = textBoxRef.current?.value;

            if (newText) {
                setEditable(false);
                onTextChanged?.(newText);
            }
        }

        if (e.key === "Escape") {
            setEditable(false);
        }
    }

    return (
        <div className="EditableLable-Component">
            {editable ? (
                <input type="text" ref={textBoxRef} onKeyDown={handleKeyDown}/>
            ) : (
                <span>{children}</span>
            )}
        </div>
    );
}