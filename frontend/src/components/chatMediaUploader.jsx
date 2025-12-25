import React, { useState, useRef } from "react";
import { Image } from "lucide-react";
import { compressImage } from "../utils/compressImage";

const ChatMediaUploader = ({ onFilesSelected }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const processedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        if (file.type.startsWith("image/")) {
          return await compressImage(file, 0.6);
        }
        return file;
      })
    );

    setFiles(processedFiles);
    if (onFilesSelected) onFilesSelected(processedFiles);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    if (onFilesSelected) onFilesSelected(newFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* HIDDEN INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,video/*"
        onChange={handleSelect}
        className="hidden"
      />

      {/* WHATSAPP STYLE ICON BUTTON */}
      <button
        type="button"
        onClick={openFilePicker}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition"
      >
        <Image className="w-6 h-6 text-gray-700" />
      </button>

      {/* PREVIEW ROW */}
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mt-2">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative">
                {file.type.startsWith("image/") ? (
                  <img
                    src={url}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <video
                    src={url}
                    className="w-20 h-20 rounded object-cover"
                    controls
                  />
                )}

                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatMediaUploader;
