/**
 * the order is for the list generator
 */
export interface AssignTypeInterface {
  id: string;
  name: string;
  hasAssistant?: boolean;
  repeat: boolean;
  publicSpeech: boolean;
  order: number;
  color?: string;
}
