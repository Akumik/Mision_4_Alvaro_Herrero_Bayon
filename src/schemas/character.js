import { z } from 'zod'

export const SUBCLASS_LEVEL = 3;

export function createCharacterSchema(races = [], classes = []) {
    return z.object({
        name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres" })
        .max(40, { error: "El nombre no puede tener más de 40 caracteres" }),
        race: z.string().min(1, { error: "Debes seleccionar una raza" }),
        subrace: z.string(),
        class: z.string().min(1, { error: "Debes seleccionar una clase" }),
        subclass: z.string(),
        level: z.coerce.number({ error: "El nivel debe ser un número" })
        .int({ error: "El nivel debe ser un número entero" })
        .min(1, { error: "El nivel debe ser al menos 1" })
        .max(20, { error: "El nivel no puede ser mayor a 20" })
    }).superRefine((data, ctx) => {
        const race = races.find((r) => r.id === data.race);
        if(race && race.subraces.length > 0) {
            if(!data.subrace) {
                ctx.addIssue({code: "custom", path: ["subrace"], message: "Debes seleccionar una subraza"});
            } else if(!race.subraces.some((sr) => sr.id === data.subrace)) {
                ctx.addIssue({code: "custom", path: ["subrace"], message: "La subraza seleccionada no es válida"});
            }
        }

        const cls = classes.find((c) => c.id === data.class);

        if(cls){
            if (data.level >= SUBCLASS_LEVEL && !data.subclass) {
                ctx.addIssue({code: "custom", path: ["subclass"], message: `A nivel ${data.level} tu ${cls.name} debe tener una subclase`});
            } else if (data.level < SUBCLASS_LEVEL && data.subclass) {
                ctx.addIssue({ code: "custom", path: ["subclass"], message: `La subclase se elige a nivel ${SUBCLASS_LEVEL}`});
            } else if (data.subclass && !cls.subclasses.some((sc) => sc.id === data.subclass)) {
                ctx.addIssue({ code: "custom", path: ["subclass"], message: `Esa subclase no es de ${cls.name}`});
            }
        }
    });
}