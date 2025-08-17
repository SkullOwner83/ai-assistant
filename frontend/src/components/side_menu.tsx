import React from 'react'
import type { Conversation } from '../interfaces/conversation'

interface SideMenuProp {
    isOpen: boolean,
    items: Array<Conversation>,
    selectedItem: Conversation | null,
    onSelectedItem: (item: Conversation | null) => void,
    onToggle: () => void
}

export const SideMenu: React.FC<SideMenuProp> = ({ isOpen, items, selectedItem, onSelectedItem, onToggle }) => {
    return (
        <div className={`Side-Menu ${!isOpen ? "Hidden-Menu" : ""}`}>
            <button className="Hidde-Button" onClick={()=> onToggle()}>-</button>
            <ul className={!isOpen ? "Hidden" : ""}>
                {Object.values(items).map((item, index) => (
                    <li key={index}>
                        <button
                            className={selectedItem == item ? "Active" : ""} 
                            onClick={()=> onSelectedItem(item)}>
                            {item.title}
                        </button>
                    </li>
                ))}
            </ul>

            <div className={`Action-Buttons ${!isOpen ? "Hidden" : ""}`}>
                <button onClick={() => onSelectedItem(null)}>+</button>
            </div>
        </div>
    )
}
