import { z } from 'zod';

export const votanteLoginSchema = z.object({
  serie: z
    .array(
      z
        .string()
        .length(1, 'Cada letra debe ser exactamente 1 carácter')
        .regex(/^[A-Z]$/, 'Solo se permiten letras')
    )
    .length(3, 'La serie debe tener exactamente 3 letras'),
  numero: z
    .array(
      z
        .string()
        .length(1, 'Cada dígito debe ser exactamente 1 carácter')
        .regex(/^[0-9]$/, 'Solo se permiten números')
    )
    .length(5, 'El número debe tener exactamente 5 dígitos'),
});
