import * as express from 'express-serve-static-core'

declare global {
  namespace express {
    interface Request {
      customField?: string
    }
    interface Request {
      file?: Multer.File
    }
  }
}
