import { dynamicTool } from "ai"
import { z } from "zod"
import { renderSvg, type DesignSpec } from "@/agent/design/lib/renderSvg"

const textLayerSchema = z
  .object({
    text: z.string().describe("Text content. Use \\n for a new line."),
    color: z
      .string()
      .optional()
      .describe("Hex color for the text, e.g. '#ffffff'. Defaults to white."),
    fontSize: z.number().positive().optional().describe("Font size in pixels"),
    fontWeight: z.string().optional().describe("CSS font weight, e.g. '700', '600', '400'"),
    letterSpacing: z.number().optional().describe("Letter spacing in pixels"),
    align: z.enum(["left", "center"]).optional().describe("Text alignment (default center)"),
    maxWidth: z
      .number()
      .positive()
      .optional()
      .describe(
        "Maximum text width in pixels. Text wraps to multiple lines and long lines auto-shrink to fit. Defaults to the canvas width minus safe margins — only set it to constrain further.",
      ),
    y: z
      .number()
      .optional()
      .describe("Explicit vertical center position in pixels. Omit to use automatic layout."),
  })
  .describe("A single line or block of text with optional styling")

const shapeSchema = z
  .object({
    type: z
      .enum(["rect", "circle", "ellipse", "line", "triangle", "ring", "emoji"])
      .describe("Shape kind"),
    x: z
      .number()
      .describe("Position. Left/top edge for rect/line, center for circle/ellipse/triangle/emoji."),
    y: z
      .number()
      .describe("Position. Left/top edge for rect/line, center for circle/ellipse/triangle/emoji."),
    width: z
      .number()
      .optional()
      .describe(
        "Width (diameter x2 of horizontal radius for ellipse). Required for rect/ellipse/line/triangle.",
      ),
    height: z
      .number()
      .optional()
      .describe(
        "Height (diameter x2 of vertical radius for ellipse). Optional for rect/ellipse/line/triangle.",
      ),
    size: z
      .number()
      .optional()
      .describe("Circle/ring diameter, emoji size, or stroke width for a line"),
    rx: z.number().optional().describe("Corner radius for a rect"),
    glyph: z.string().optional().describe("For type 'emoji': a single emoji glyph, e.g. '🚀'"),
    color: z
      .string()
      .optional()
      .describe(
        "Hex color, e.g. '#f59e0b'. Fill for shapes, stroke for rings, body color for lines.",
      ),
    opacity: z.number().min(0).max(1).optional().describe("Fill opacity 0-1 (default 1)"),
    strokeColor: z
      .string()
      .optional()
      .describe("Hex color for an outline (only used when strokeWidth is set)"),
    strokeWidth: z
      .number()
      .positive()
      .optional()
      .describe(
        "Outline width in pixels. Set to outline a rect/circle/ellipse/triangle instead of a solid fill.",
      ),
  })
  .describe("A decorative shape drawn behind the text")

const buttonSchema = z
  .object({
    text: z.string().describe("Button label"),
    x: z.number().describe("Button center x in pixels"),
    y: z.number().describe("Button center y in pixels"),
    width: z
      .number()
      .positive()
      .optional()
      .describe("Button width in pixels. Omit to auto-size to the label."),
    height: z
      .number()
      .positive()
      .optional()
      .describe("Button height in pixels. Defaults to twice the font size."),
    background: z.string().describe("Hex fill color for the button, e.g. '#fbbf24'"),
    color: z.string().optional().describe("Hex label color, e.g. '#0f172a'. Defaults to dark."),
    fontSize: z.number().positive().optional().describe("Label font size in pixels (default 28)"),
    radius: z
      .number()
      .optional()
      .describe("Corner radius in pixels. Defaults to a fully rounded pill."),
  })
  .describe("A call-to-action button — rounded rectangle with centered label")

const backgroundSchema = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("solid"), color: z.string().describe("Hex color, e.g. '#0f172a'") }),
    z.object({
      type: z.literal("linear"),
      from: z.string().describe("Hex start color, e.g. '#2563eb'"),
      to: z.string().describe("Hex end color, e.g. '#7c3aed'"),
      angle: z
        .number()
        .optional()
        .describe("Gradient angle in degrees clockwise from right (default 135)"),
    }),
    z.object({
      type: z.literal("radial"),
      from: z.string().describe("Hex center color, e.g. '#f59e0b'"),
      to: z.string().describe("Hex edge color, e.g. '#0f172a'"),
      cx: z.number().optional().describe("Gradient center x in pixels (default canvas center)"),
      cy: z.number().optional().describe("Gradient center y in pixels (default canvas center)"),
      radius: z
        .number()
        .optional()
        .describe("Gradient radius in pixels (defaults to cover the canvas)"),
    }),
  ])
  .describe("Canvas background")

export const generate_design_tool = dynamicTool({
  description:
    "Generate a polished vector graphic — social media post, banner, flyer, quote card, announcement, or similar — from a structured design specification and return its contents to be shown in the UI. Use this when the user asks to create, design, or generate an image, graphic, poster, banner, or flyer. Supports solid/linear/radial backgrounds, decorative shapes and emoji, call-to-action buttons, and auto-wrapped text. Returns the SVG image data and a filename for the generated design.",
  inputSchema: z.object({
    name: z
      .string()
      .optional()
      .describe("Short descriptive name for the design, used as the download filename"),
    width: z
      .number()
      .positive()
      .describe(
        "Canvas width in pixels (1080x1080 post, 1920x1080 banner, 1080x1920 story, 1200x1600 flyer, 1600x900 quote)",
      ),
    height: z.number().positive().describe("Canvas height in pixels"),
    background: backgroundSchema,
    title: textLayerSchema
      .optional()
      .describe("Main headline — short and bold. Wraps automatically to fit the canvas."),
    subtitle: textLayerSchema
      .optional()
      .describe("Supporting line or body text under the title. Wraps automatically."),
    footer: textLayerSchema
      .optional()
      .describe("Small text near the bottom, e.g. event date or handle"),
    shapes: z
      .array(shapeSchema)
      .max(16)
      .optional()
      .describe("Up to 16 decorative shapes drawn behind the text"),
    buttons: z
      .array(buttonSchema)
      .max(4)
      .optional()
      .describe("Up to 4 call-to-action buttons drawn behind the text"),
  }),
  execute: async (params) => {
    try {
      return renderSvg(params as DesignSpec)
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  },
})
