interface Modal {
    isOpen: boolean,
    onClose: () => void,
    children?: React.ReactNode
}

export const Modal: React.FC<Modal> = ({ isOpen, onClose, children }) => {
    return (
        <div className={`Modal-Component ${isOpen ? "Visible" : "Hidden"}`} onClick={onClose}>
            <div className="Modal-Content" onClick={(e) => {e.stopPropagation()}}>{children}</div>
        </div>
    );
}