export type UploadResult = {
    success: boolean
    photo?: {
      id: string
      url: string
      date_taken: string
    }
    error?: string
  }
  
  export type ExifValidationResult = {
    valid: boolean
    dateTaken?: Date
    error?: string
  }