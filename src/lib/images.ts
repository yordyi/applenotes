import { getDB, getImage, putImage } from '@/src/store/db'
import { IMAGE_ID_ATTR, newId } from './note'

/** blob: URLs for images already loaded, shared by the editor, list and gallery. */
const urls = new Map<string, Promise<string | null>>()

export function imageUrl(id: string): Promise<string | null> {
  let url = urls.get(id)
  if (!url) {
    url = getDB()
      .then(db => getImage(db, id))
      .then(blob => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => null)
    urls.set(id, url)
  }
  return url
}

/** Stores an image and returns its id and a URL to show it right away. */
export async function saveImage(blob: Blob): Promise<{ id: string; url: string }> {
  const id = newId()
  await putImage(await getDB(), { id, blob, createdAt: new Date().toISOString() })
  const url = URL.createObjectURL(blob)
  urls.set(id, Promise.resolve(url))
  return { id, url }
}

/** Fills in `src` for every stored image under `root`. */
export function hydrateImages(root: HTMLElement) {
  root.querySelectorAll<HTMLImageElement>(`img[${IMAGE_ID_ATTR}]`).forEach(img => {
    if (img.getAttribute('src')) return
    imageUrl(img.getAttribute(IMAGE_ID_ATTR)!).then(url => {
      if (url) img.src = url
    })
  })
}

/** The editor's HTML for saving: image `src`s are per-session blob: URLs, so drop them. */
export function serializeEditor(root: HTMLElement): string {
  if (!root.querySelector(`img[${IMAGE_ID_ATTR}][src]`)) return root.innerHTML
  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`img[${IMAGE_ID_ATTR}]`).forEach(img => img.removeAttribute('src'))
  return clone.innerHTML
}

/** Shrinks an image file so stored notes stay small. */
export async function imageFileToBlob(file: File, maxSize = 1600): Promise<Blob> {
  const src = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = src
    })
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas unavailable')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85)
    )
  } finally {
    URL.revokeObjectURL(src)
  }
}
