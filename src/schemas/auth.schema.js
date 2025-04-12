import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido',
      invalid_type_error: 'El nombre debe ser un texto'
    })
    .min(1)
    .max(255),
  lastName: z
    .string({
      required_error: 'El apellido es requerido',
      invalid_type_error: 'El apellido debe ser un texto'
    })
    .min(1)
    .max(255),
  email: z
    .string({
      required_error: 'El email es requerido',
      invalid_type_error: 'El email debe ser un texto'
    })
    .email({
      message: 'El email debe ser un email válido'
    }),
  password: z
    .string({
      required_error: 'La contraseña es requerida',
      invalid_type_error: 'La contraseña debe ser un texto'
    })
    .min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres'
    })
    .max(255, {
      message: 'La contraseña debe tener máximo 255 caracteres'
    }),
  country: z
    .string({
      required_error: 'El país es requerido',
      invalid_type_error: 'El país debe ser un texto'
    })
    .min(1)
    .max(100),
  city: z
    .string({
      required_error: 'La ciudad es requerida',
      invalid_type_error: 'La ciudad debe ser un texto'
    })
    .min(1)
    .max(100),
  address: z
    .string({
      required_error: 'La dirección es requerida',
      invalid_type_error: 'La dirección debe ser un texto'
    })
    .min(1)
    .max(255),
  gender: z
    .string({
      required_error: 'El género es requerido',
      invalid_type_error: 'El género debe ser un texto'
    })
    .min(1)
    .max(20),
  birthDate: z
    .string({
      required_error: 'La fecha de nacimiento es requerida',
      invalid_type_error: 'La fecha de nacimiento debe ser una fecha válida'
    })
    .refine(date => !isNaN(Date.parse(date)), {
      message: 'La fecha de nacimiento no es válida'
    }),
  docType: z
    .string({
      required_error: 'El tipo de documento es requerido',
      invalid_type_error: 'El tipo de documento debe ser un texto'
    })
    .min(1)
    .max(30),
  docNumber: z
    .string({
      required_error: 'El número de documento es requerido',
      invalid_type_error: 'El número de documento debe ser un texto'
    })
    .min(1)
    .max(20),
  affiliation: z
    .string({
      required_error: 'La afiliación es requerida',
      invalid_type_error: 'La afiliación debe ser un texto'
    })
    .min(1)
    .max(255),
  phoneNumber: z
    .string({
      required_error: 'El número de teléfono es requerido',
      invalid_type_error: 'El número de teléfono debe ser un texto'
    })
    .min(7)
    .max(20),
  occupation: z
    .string({
      required_error: 'El oficio es requerido',
      invalid_type_error: 'El oficio debe ser un texto'
    })
    .min(1)
    .max(100),
  isIeeeMember: z
    .boolean({
      required_error: 'El estado de miembro IEEE es requerido',
      invalid_type_error: 'El estado de miembro IEEE debe ser verdadero o falso'
    }),
  studentGroup: z
    .string({
      required_error: 'El grupo estudiantil es requerido',
      invalid_type_error: 'El grupo estudiantil es un texto'
    }),
  participationType: z
    .string({
      required_error: 'El tipo de participación es requerido',
      invalid_type_error: 'El tipo de participación debe ser un texto'
    })
    .min(1)
    .max(100),
  attendanceType: z
    .string({
      required_error: 'El tipo de asistencia es requerido',
      invalid_type_error: 'El tipo de asistencia debe ser un texto'
    })
    .min(1)
    .max(100),
  taxAmount: z
    .string({
      required_error: 'El valor del impuesto es requerido',
      invalid_type_error: 'El valor del impuesto debe ser un número'
    })
    .min(0)
    .max(100)
});

export const signinSchema = z.object({
  email: z
    .string({
      required_error: "El email es requerido",
      invalid_type_error: "El email debe ser un texto",
    })
    .email({
      message: "El Email debe ser un email valido",
    }),
  password: z
    .string({
      required_error: "La contraseña es requerida",
      invalid_type_error: "La contraseña debe ser un texto",
    })
    .min(6, {
      message: 'La contraseña debe tener al menos 6 caracteres'
    })
    .max(255, {
      message: 'La contraseña debe tener máximo 255 caracteres'
    }),
});
