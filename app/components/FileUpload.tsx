"use client"

import { upload } from "@imagekit/next";
import { useState } from "react";

interface ImageFileUploadProps {
    onSuccess: (res: any) => void;
    onProgressUpload?: (progress: number) => void;
    ImageFileType?: "image";
}

const ImageFileUpload = ({ onSuccess, onProgressUpload, ImageFileType }: ImageFileUploadProps) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    //validation

    const validateFile = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB");
            return false;
        }
        if (ImageFileType === "image") {
            //const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!file.type.startsWith("image/")) {
                setError("Invalid file type");
                return false;
            }
        }
        setError(null);
        return true;
    };

    const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Image file", e.target.value)

        const file = e.target.files?.[0]
        if (!file || !validateFile(file)) {
            alert("Please select a file to upload");
            return;
        }

        setUploading(true);
        setError(null)

        try {
            const imagekitAuthRes = await fetch("/api/imagekit-auth");
            const imagekitRes = await imagekitAuthRes.json();

            console.log("imagekitRes : ", imagekitRes);

            const { token, signature, expire, publicKey } = imagekitRes;
            const uploadedResImagekit = await upload({
                file,
                expire,
                token,
                signature,
                publicKey,
                fileName: file.name,
                onProgress: (event) => {
                    if (event.lengthComputable && onProgressUpload) {
                        const percentage = (event.loaded / event.total) * 100;
                        onProgressUpload(Math.round(percentage));
                    }
                }
            })

            console.log("Uploaded image in Imagekit res ", uploadedResImagekit)
            onSuccess(uploadedResImagekit)

        } catch (error: any) {
            console.log("Upload Failed", error)
            setError(error)
            throw new Error(error)
        }finally{
            setUploading(false)
        }
    }

    return (
        <>
        <input type="file" accept="image/*" onChange={handleImageFileUpload}/>
        {uploading && <span>Uploading...</span>}
        {error && <span>{error}</span>}
        </>
    )
}

export default ImageFileUpload