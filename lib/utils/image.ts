import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    preserveExif: true, // jangan hapus EXIF
  }

  try {
    return await imageCompression(file, options)
  } catch {
    // kalau gagal compress, return file asli
    return file
  }
}

export async function createThumbnail(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    preserveExif: false,
  }

  try {
    return await imageCompression(file, options)
  } catch {
    return file
  }
}