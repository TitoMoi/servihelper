/**
 * the order is for the list generator
 */
export interface AssignTypeInterface {
  id: string;
  name: string;
  tKey: string; //translationKey
  hasAssistant?: boolean;
  repeat: boolean;
  type: AssignTypes;
  order: number;
  color?: string;
  days?: number; //the number of days that must pass before the participant can repeat this assign type
}

export type AssignTypes =
  | "chairman"
  | "publicSpeech"
  | "initialPrayer"
  | "endingPrayer"
  | "treasures"
  | "spiritualGems"
  | "bibleReading"
  | "analysysAudience"
  | "initialCall"
  | "returnVisit"
  | "bibleStudy"
  | "talk"
  | "explainBeliefs"
  | "livingAsChristians"
  | "congregationBibleStudy"
  | "other";
