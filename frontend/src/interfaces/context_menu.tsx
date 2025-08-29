import type { Conversation } from "./conversation";

export interface ContextMenu {
    visible: boolean,
    x: number,
    y: number,
    conversation?: Conversation
}