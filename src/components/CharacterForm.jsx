import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCharacter, getClasses, getRaces } from "../services/api.js";
import { createCharacterSchema, SUBCLASS_LEVEL } from "../schemas/character.js";

function Field({ name, label, error, hint, children }){
    return (
        <div>
            <label htmlFor={name}>{label}</label>
            {children}
            {hint && <p id={`${name}-hint`} className="hint">{hint}</p>}
            {error && <p id={`${name}-error`} role="alert" className="error">{error.message}</p>}
        </div>
    );
}

export default function CharacterForm() {
    const races = useQuery({ queryKey: ["races"], queryFn: getRaces});
    const classes = useQuery({ queryKey: ["classes"], queryFn: getClasses});

    if(races.isPending || classes.isPending){
        return <p role="status">Cargando razas y clases</p>;
    }

    if(races.isError || classes.isError){
        return (
            <div role="alert">
                <p>No se pudieron cargar las razas o las clases</p>
                <button type="button" onClick={() => { races.refetch(); classes.refetch(); }}>Reintentar</button>
            </div>
        );
    }
    return <CharacterFormFields races={races.data} classes={classes.data} />;
}

function CharacterFormFields({ races, classes }){
    const queryClient = useQueryClient();
    const schema = createCharacterSchema(races, classes);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {name: "", race: "", subrace: "", class: "", level: 1}
    });

    const mutation = useMutation({
        mutationFn: createCharacter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["characters"]});
            reset();
        }
    });

    const simplifier = (name, hint = false) => ({
        id: name,
        "aria-invalid": !!errors[name],
        "aria-describedby": errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined
    });

    
    const selectedRace = races.find((races) => races.id === watch("race"));
    const selectedClass = classes.find((classes) => classes.id === watch("class"));
    const showSubrace = selectedRace?.subraces.length > 0;
    const showSubclass = selectedClass && Number(watch("level")) >= SUBCLASS_LEVEL;

    function onSubmit(data){
        mutation.mutate({...data, subrace: data.subrace || null, subclass: data.subclass || null});
    }
    
    return(
        <section>
            <h2>Nuevo Personaje</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Field name="name" label="Nombre" error={errors.name}>
                    <input autoComplete="off" {...simplifier("name")} {...register("name")}/>
                </Field>

                <Field name="race" label="Raza" error={errors.race}>
                    <select {...simplifier("race")} {...register("race", { onChange: () => setValue("subrace", ""), deps: ["subrace"]})}>
                        <option value="">Elige una raza</option>
                        {races.map((races) => <option key={races.id} value={races.id}>{races.name}</option>)}
                    </select>
                </Field>

                {showSubrace && (
                    <Field name="subrace" label="Subraza" error={errors.subrace}>
                        <select {...simplifier("subrace")} {...register("subrace")}>
                            <option value="">Elige una subraza</option>
                            {selectedRace.subraces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                )}
                <Field name="class" label="Clase" error={errors.class}>
                    <select {...simplifier("class")} {...register("class", { onChange: () => setValue("subclass", ""), deps: ["subclass"] })}>
                        <option value="">Elige una clase</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>

                <Field name="level" label="Nivel" error={errors.level} hint={`La subclase se elige a partir del nivel ${SUBCLASS_LEVEL}.`}>
                    <input
                        type="number" min="1" max="20"
                        {...simplifier("level", true)}
                        {...register("level", {
                            onChange: (e) => { if (Number(e.target.value) < SUBCLASS_LEVEL) setValue("subclass", ""); },
                            deps: ["subclass"],
                        })}
                    />
                </Field>

                {showSubclass && (
                    <Field name="subclass" label="Subclase" error={errors.subclass}>
                        <select {...simplifier("subclass")} {...register("subclass")}>
                            <option value="">— Elige una subclase —</option>
                            {selectedClass.subclasses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </Field>
                )}

                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Creando…" : "Crear personaje"}
                </button>

                {mutation.isError && <p role="alert" className="error">{mutation.error.message}</p>}
                {mutation.isSuccess && <p role="status" className="ok">¡Personaje creado!</p>}
            </form>
        </section>
    )
}