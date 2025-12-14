export type ConfigurationType = "text" | "richText" | "image" | "movie";

export interface Configuration {
  key: string;
  value: string;
  description: string;
  type: ConfigurationType;
  creator_id: number;
  creation_time: string;
  last_modification_time: string;
  last_modificator_id: number;
}
