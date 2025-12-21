export interface Page {
  id: number;
  title: string;
  description: string;
  header_image_url: string | null;
  slug: string;
  meta_data: string;
  creation_time: string;
  creator_id: number | null;
  last_modification_time: string | null;
  last_modificator_id: number | null;
}

