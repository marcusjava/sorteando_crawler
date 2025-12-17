import { z } from "zod";

export const registerSchema = z.object({
  numero_sorteio: z.union([z.string(), z.number()]),
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  email: z.string().email("Email inválido"),
});

export const createSorteioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type CreateSorteioData = z.infer<typeof createSorteioSchema>;
