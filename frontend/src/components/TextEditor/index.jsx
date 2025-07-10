import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function TextEditor({ onChange, disabled, initialValue = "" }) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_KEY}
      init={{
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
      }}
      onInit={(_evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      onEditorChange={(content) => {
        onChange?.(content);
      }}
      disabled={disabled}
    />
  );
}
