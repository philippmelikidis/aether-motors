const { z } = require("zod");

const modelConfigSchema = z
  .object({
    temperature: z.number().min(0).max(1).optional(),
    topP: z.number().min(0).max(1).optional(),
    maxOutputTokens: z.number().int().min(64).max(2048).optional()
  })
  .optional();

const requestSchema = z.object({
  text: z.string().min(1).max(2000),
  config: modelConfigSchema,
  budget: z.number().min(0).optional(),
  budgetCurrency: z.string().min(1).max(10).optional()
});

const configSchema = z.object({
  configuration: z.object({
    model: z.string().min(1),
    selections: z.record(z.string().min(1)).refine((value) => Object.keys(value).length > 0, {
      message: "selections must include at least one entry"
    })
  }),
  reasoning: z.object({
    model: z.string().min(1),
    selections: z.record(z.string().min(1)).refine((value) => Object.keys(value).length > 0, {
      message: "selections must include at least one entry"
    })
  }),
  summary: z.string().min(1)
});

module.exports = {
  modelConfigSchema,
  requestSchema,
  configSchema
};
