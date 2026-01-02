#!/bin/bash
# Convert SVG OG images to PNG
# Requirements: Install Inkscape or ImageMagick
#
# Using Inkscape:
#   brew install inkscape
#
# Using ImageMagick (with rsvg):
#   brew install imagemagick librsvg

echo "Converting OpenGraph images from SVG to PNG..."

# Check if we have the tools
if command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
elif command -v convert &> /dev/null; then
    CONVERTER="convert"
else
    echo "Error: Neither Inkscape nor ImageMagick found."
    echo "Install one of them:"
    echo "  brew install inkscape"
    echo "  OR"
    echo "  brew install imagemagick librsvg"
    exit 1
fi

# Convert main OG image
if [ -f "public/og-image.svg" ]; then
    if [ "$CONVERTER" = "inkscape" ]; then
        inkscape --export-type=png --export-filename=public/og-image.png -w 1200 -h 630 public/og-image.svg
    else
        convert -density 150 public/og-image.svg public/og-image.png
    fi
    echo "✓ Converted og-image.svg"
fi

# Convert OG images in og/ directory
for svg in public/og/*.svg; do
    if [ -f "$svg" ]; then
        png="${svg%.svg}.png"
        if [ "$CONVERTER" = "inkscape" ]; then
            inkscape --export-type=png --export-filename="$png" -w 1200 -h 630 "$svg"
        else
            convert -density 150 "$svg" "$png"
        fi
        echo "✓ Converted $(basename $svg)"
    fi
done

echo ""
echo "Done! PNG images are ready in public/ and public/og/"
