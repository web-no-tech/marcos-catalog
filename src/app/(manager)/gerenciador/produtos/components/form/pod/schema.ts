import { z } from 'zod'

export const podSchema = {
  manufacturer: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    { required_error: 'Selecione a marca do pod' },
  ),
  model: z.object({
    label: z.string(),
    value: z.string(),
  }),
  puffs: z
    .string({ required_error: 'Insira os puffs do pod' })
    .min(1, 'Insira os puffs do pod'),
  flavor: z.object(
    {
      label: z.string(),
      value: z.string(),
    },
    { required_error: 'Selecione o sabor do pod' },
  ),
}
