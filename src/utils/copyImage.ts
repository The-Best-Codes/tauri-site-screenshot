import { writeImage } from "@tauri-apps/plugin-clipboard-manager";

/**
 * Copies an image to the system clipboard.
 *  Supports different image formats as input.
 *
 *  Platform-specific:
 *   - Android / iOS: Not supported.
 *
 * @param image - The image data to copy to the clipboard. Can be a string (likely a file path),
 *                an Image object, a Uint8Array, an ArrayBuffer, or a number array representing the image.
 * @returns A Promise that resolves when the image has been successfully copied, or rejects if an error occurs.
 * @since 2.0.0
 */
export async function copyImage(
  image: string | Uint8Array | ArrayBuffer | number[],
): Promise<void> {
  try {
    await writeImage(image);
  } catch (error) {
    console.error("Failed to copy image to clipboard:", error);
    throw new Error(`Failed to copy image to clipboard: ${error}`);
  }
}
