import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchByName, getRaces, getClasses } from '../services/api.js'

export default function ListadoPersonajes() {
    const [search, setSearch] = useState("");

    const characters = useQuery({
        queryKey: ["characters", search],
        queryFn: searchByName,
    });

    const races = useQuery({
        queryKey: ["races"],
        queryFn: getRaces,
    });

    const classes = useQuery({
        queryKey: ["classes"],
        queryFn: getClasses,
    });

    const raceName = (id) => races.data?.find(race => race.id === id)?.name ?? id;
    const className = (id) => classes.data?.find(cls => cls.id === id)?.name ?? id;

    return (
        <section>
            <h2>Personajes</h2>

            <label htmlFor = "search">Buscar por nombre:</label>
            <input id = "search" value = {search} onChange = {(e) => setSearch(e.target.value)} />

            {characters.isPending && <p role = "status">Cargando personajes...</p>}

            {characters.isError && (
                <div role = "alert">
                    <p>{characters.error.message}</p>
                    <button onclick = {() => characters.refetch()}>Reintentar</button>
                </div>
            )}

            {characters.isSuccess && characters.data.length === 0 && (
                <p>{search ? "Ningun personaje coincide con la busqueda" : "Aun noo hay personajes"}</p>
            )}

            {characters.isSuccess && characters.data.length > 0 && (
                <ul>
                    {characters.data.map(character => (
                        <li key={character.id}>
                            <strong>{character.name}</strong> - {raceName(character.race)} {className(character.class)}, level {character.level}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}