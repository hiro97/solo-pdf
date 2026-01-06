import { BaseRenderer } from './base'
import type { FabricObject, FabricImageObject, SaveContext } from '../types'

/**
 * Renderer for image annotations including signatures.
 * Handles PNG and JPEG images embedded as data URLs.
 */
export class ImageRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    const type = this.getObjectType(obj)
    return type === 'image'
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    const imageObj = obj as FabricImageObject

    // Validate image source
    if (!imageObj.src) {
      this.addError(
        ctx,
        annotationId,
        'image',
        'Image annotation has no source data. The image may not have been properly saved.',
        true
      )
      return
    }

    try {
      const dataUrl = imageObj.src
      const base64Data = dataUrl.split(',')[1]

      if (!base64Data) {
        this.addError(
          ctx,
          annotationId,
          'image',
          'Invalid image data URL format.',
          true
        )
        return
      }

      // Decode base64 to bytes
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

      // Embed image based on format
      let embeddedImage
      if (dataUrl.startsWith('data:image/png')) {
        embeddedImage = await ctx.pdfDoc.embedPng(imageBytes)
      } else if (
        dataUrl.startsWith('data:image/jpeg') ||
        dataUrl.startsWith('data:image/jpg')
      ) {
        embeddedImage = await ctx.pdfDoc.embedJpg(imageBytes)
      } else {
        // Try PNG as fallback for other formats
        this.addWarning(
          ctx,
          annotationId,
          'image',
          `Unknown image format, attempting PNG embedding.`
        )
        try {
          embeddedImage = await ctx.pdfDoc.embedPng(imageBytes)
        } catch {
          this.addError(
            ctx,
            annotationId,
            'image',
            'Unsupported image format. Only PNG and JPEG are supported.',
            true
          )
          return
        }
      }

      // Calculate dimensions using Fabric object dimensions
      const coords = this.transformCoordinates(
        {
          left: imageObj.left,
          top: imageObj.top,
          width: imageObj.width ?? embeddedImage.width,
          height: imageObj.height ?? embeddedImage.height,
          scaleX: imageObj.scaleX,
          scaleY: imageObj.scaleY,
          originX: imageObj.originX,
          originY: imageObj.originY,
        },
        ctx
      )

      // Draw the image
      ctx.page.drawImage(embeddedImage, {
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height,
        opacity: imageObj.opacity ?? 1,
      })
    } catch (error) {
      this.addError(
        ctx,
        annotationId,
        'image',
        `Failed to embed image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }
}
