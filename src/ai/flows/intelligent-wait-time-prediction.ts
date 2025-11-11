'use server';

/**
 * @fileOverview An intelligent wait time prediction AI agent.
 *
 * - predictWaitTime - A function that predicts the wait time for an order.
 * - PredictWaitTimeInput - The input type for the predictWaitTime function.
 * - PredictWaitTimeOutput - The return type for the predictWaitTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictWaitTimeInputSchema = z.object({
  outletId: z.string().describe('The ID of the outlet the order is being placed at.'),
  itemIds: z.array(z.string()).describe('The IDs of the items in the order.'),
  orderTime: z.string().describe('The time the order is being placed, in ISO format.'),
  queueDepth: z.number().describe('The current number of orders in the queue.'),
});
export type PredictWaitTimeInput = z.infer<typeof PredictWaitTimeInputSchema>;

const PredictWaitTimeOutputSchema = z.object({
  estimatedWaitTime: z.number().describe('The estimated wait time for the order, in minutes.'),
  reasoning: z.string().describe('The reasoning behind the estimated wait time.'),
});
export type PredictWaitTimeOutput = z.infer<typeof PredictWaitTimeOutputSchema>;

export async function predictWaitTime(input: PredictWaitTimeInput): Promise<PredictWaitTimeOutput> {
  return predictWaitTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictWaitTimePrompt',
  input: {schema: PredictWaitTimeInputSchema},
  output: {schema: PredictWaitTimeOutputSchema},
  prompt: `You are an AI assistant that predicts the estimated wait time for customer orders in a cafeteria.

You are provided with the following information:
- The outlet ID: {{{outletId}}}
- The items in the order (item IDs): {{{itemIds}}}
- The time the order is being placed: {{{orderTime}}}
- The current number of orders in the queue: {{{queueDepth}}}

Consider these factors:
- Historical order data (you have access to this information and should use it to inform your prediction).
- Menu item preparation times (you have access to this information and should use it to inform your prediction).
- Current queue depth (the number of orders currently being prepared).
- Outlet break times (the times when the outlet is less busy).

Based on this information, predict the estimated wait time for the order in minutes. Also, provide a brief explanation of your reasoning.

Output should be in JSON format.
`,
});

const predictWaitTimeFlow = ai.defineFlow(
  {
    name: 'predictWaitTimeFlow',
    inputSchema: PredictWaitTimeInputSchema,
    outputSchema: PredictWaitTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
