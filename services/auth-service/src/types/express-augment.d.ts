// Fallback ambient declaration for Multer's Request augmentation.
// @types/multer should normally provide this, but this guarantees
// `req.file` type-checks even if that package fails to resolve on a
// given build host.
declare global {
  namespace Express {
    interface Request {
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
        destination?: string;
        filename?: string;
        path?: string;
      };
    }
  }
}

export {};
