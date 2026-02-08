import multer from "multer";
export declare const upload: multer.Multer;
export declare const getImagePath: (filename: string) => string;
export declare const deleteImageFile: (imagePath: string) => void;
