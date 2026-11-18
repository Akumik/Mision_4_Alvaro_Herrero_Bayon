const API_URL = import.meta.env.VITE_API_URL;

const API_Characters = `${API_URL}/characters`;
const API_Races = `${API_URL}/races`;
const API_Classes = `${API_URL}/classes`;

export async function searchByName(name) {
    const searchedName = (name.queryKey[1] || "").toLowerCase();

    const response = await fetch(API_Characters);
    if(!response.ok) {
        throw new Error(`No se pudieron cargar los personajes (error ${response.status})`);
    }
    const text = await response.json();

    if(!searchedName) {
        return text;
    }

    return text.filter(character => character.name.toLowerCase().includes(searchedName));
}

export async function getRaces() {
    const response = await fetch(API_Races);
    if(!response.ok) {
        throw new Error(`No se pudieron cargar las razas (error ${response.status})`);
    }
    return response.json();
}

export async function getClasses() {
    const response = await fetch(API_Classes);
    if(!response.ok) {
        throw new Error(`No se pudieron cargar las clases (error ${response.status})`);
    }
    return response.json();
}

export async function createCharacter(newCharacter) {
    const response = await fetch(API_Characters, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCharacter)
    });
    if(!response.ok) {
        throw new Error(`No se pudo crear el personaje (error ${response.status})`);
    }
    return response.json();
}