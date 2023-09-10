/**
 * the order is for the list generator
 */
export interface AssignTypeInterface {
  id: string;
  name: string;
  hasAssistant?: boolean;
  repeat: boolean;
  isPublicSpeech: boolean; //Marks this and only this assign type as the public speech
  order: number;
  color?: string;
  days?: number; //the number of days that must pass before the participant can repeat this assign type
}
