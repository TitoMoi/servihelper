export interface NoteInterface {
  id: string;
  name: string;
  showInHome: boolean;
  editorContent: Record<string, unknown>;
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
