import { Configuration } from "../../models/configuration";
import Input from "../form/input/InputField";
import RichTextEditor from "../form/input/RichTextEditor";
import ImageUpload from "../form/input/ImageUpload";
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
              <img
                src={config.value}
                alt={config.description}
                className="max-w-xs h-auto border border-gray-200 rounded-lg dark:border-gray-800"
              />
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}
