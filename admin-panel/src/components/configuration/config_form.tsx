import { Configuration } from "../../models/configuration";
import ImageUpload from "../form/input/ImageUpload";
import Input from "../form/input/InputField";
import RichTextEditor from "../form/input/RichTextEditor";
import VideoUpload, { getEmbedUrl } from "../form/input/VideoUpload";
import Label from "../form/Label";

interface ConfigFormProps {
  configurations: Configuration[];
  isEditMode: boolean;
  onChange: (index: number, key: string, value: string) => void;
}

export default function ConfigForm({
  configurations,
  isEditMode,
  onChange,
}: ConfigFormProps) {
  return (
    <div className="space-y-6">
      {configurations.map((config, index) => (
        <div key={config.key} className="flex flex-col gap-2">
          <Label className="text-lg font-bold text-blue-500 dark:text-blue-500">
            {config.description}
          </Label>
          {config.type === "text" ? (
            isEditMode ? (
              <Input
                type="text"
                value={config.value}
                onChange={(e) => onChange(index, "value", e.target.value)}
              />
            ) : (
              <Label>{config.value}</Label>
            )
          ) : config.type === "richText" ? (
            isEditMode ? (
              <RichTextEditor
                value={config.value}
                onChange={(value) => onChange(index, "value", value)}
              />
            ) : (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: config.value }}
              />
            )
          ) : config.type === "image" ? (
            isEditMode ? (
              <ImageUpload
                currentImage={config.value}
                onImageUploaded={(url) => onChange(index, "value", url)}
              />
            ) : (
              config.value && (
                <img
                  src={config.value}
                  alt={config.description}
                  className="max-w-xs h-auto border border-gray-200 rounded-lg dark:border-gray-800"
                />
              )
            )
          ) : config.type === "movie" ? (
            isEditMode ? (
              <VideoUpload
                currentVideo={config.value}
                onVideoUrlChanged={(url) => onChange(index, "value", url)}
              />
            ) : (
              config.value && (
                <div className="aspect-video w-full max-w-2xl">
                  <iframe
                    src={getEmbedUrl(config.value)}
                    className="w-full h-full border border-gray-200 rounded-lg dark:border-gray-800"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={config.description}
                  />
                </div>
              )
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}
