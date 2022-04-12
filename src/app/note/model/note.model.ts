export interface NoteInterface {
  id: string;
  name: string;
  editorContent: Record<string, any>;
  editorHTML: string;
}
export interface NoteAvailableInterface {
  id: number;
  available: boolean;
}

export interface NoteTableInterface {
  id: string;
  name: string;
}
