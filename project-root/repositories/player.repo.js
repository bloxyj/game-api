import { generateId } from "../utils.js";


create: (name) => {
    const player = {
        id:generateId(),
        name,
        hp: 100,
        attack: 25
    }
    
}