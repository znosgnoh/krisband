export type SongStatus = "to_practice" | "practicing" | "done";

export interface Song {
  id: string;
  title: string;
  singer: string;
  addedBy: string;
  status: SongStatus;
  youtubeUrl?: string;
  order: number;
}

export type SongFormInput = Pick<Song, "title" | "singer" | "addedBy">;

export type SongUpdateInput = Partial<SongFormInput>;
