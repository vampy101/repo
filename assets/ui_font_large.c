/*******************************************************************************
 * Size: 22 px
 * Bpp: 1
 * Opts: --bpp 1 --size 22 --font C:\Users\Danko\Documents\ArduinoWaveSpeaker\examples\winamp\assets\Quicksand-Bold.ttf -o C:\Users\Danko\Documents\ArduinoWaveSpeaker\examples\winamp\assets\ui_font_large.c --format lvgl -r 0x20-0x7f --no-compress --no-prefilter
 ******************************************************************************/

#include "ui.h"

#ifndef UI_FONT_LARGE
#define UI_FONT_LARGE 1
#endif

#if UI_FONT_LARGE

/*-----------------
 *    BITMAPS
 *----------------*/

/*Store the image of the glyphs*/
static LV_ATTRIBUTE_LARGE_CONST const uint8_t glyph_bitmap[] = {
    /* U+0020 " " */
    0x0,

    /* U+0021 "!" */
    0xff, 0xff, 0xf6, 0x48, 0xf, 0xf8,

    /* U+0022 "\"" */
    0xe7, 0xe7, 0xc6, 0xc6, 0xc4, 0x84,

    /* U+0023 "#" */
    0xc, 0x30, 0x31, 0xc1, 0xc7, 0x1f, 0xff, 0x7f,
    0xfc, 0x61, 0x81, 0x86, 0xe, 0x38, 0x38, 0xe3,
    0xff, 0xef, 0xff, 0x8c, 0x30, 0x30, 0xc1, 0xc7,
    0x2, 0x8, 0x0,

    /* U+0024 "$" */
    0xe, 0x1, 0xc0, 0x38, 0xf, 0x87, 0xfd, 0xfd,
    0xfb, 0x87, 0x70, 0xfe, 0x1f, 0xe1, 0xff, 0xf,
    0xf0, 0xfe, 0x1d, 0xd3, 0xbf, 0x7f, 0x7f, 0xc7,
    0xe0, 0x38, 0x7, 0x0, 0x0,

    /* U+0025 "%" */
    0x38, 0xc, 0x3e, 0xe, 0x31, 0x86, 0x18, 0xc7,
    0xc, 0x67, 0x6, 0x37, 0x1, 0xf3, 0xb8, 0x73,
    0xbe, 0x3, 0xbb, 0x81, 0x98, 0xc1, 0xcc, 0x61,
    0xc6, 0x31, 0xc3, 0xb8, 0xc0, 0xf8, 0x60, 0x38,

    /* U+0026 "&" */
    0x7, 0xc0, 0x3f, 0xc0, 0xf1, 0xc1, 0xc1, 0x3,
    0x80, 0x7, 0x80, 0xf, 0x80, 0x3f, 0x8c, 0xf7,
    0x99, 0xc7, 0xb3, 0x87, 0xe7, 0x7, 0x87, 0xf,
    0xc7, 0xfb, 0x87, 0xe3, 0x0,

    /* U+0027 "'" */
    0xff, 0x6d, 0x0,

    /* U+0028 "(" */
    0x6, 0x1c, 0x71, 0xc7, 0xe, 0x38, 0x70, 0xe1,
    0xc3, 0x87, 0xe, 0xe, 0x1c, 0x1c, 0x1c, 0x1c,
    0x18,

    /* U+0029 ")" */
    0xc1, 0xc1, 0xc1, 0xc1, 0xc3, 0x83, 0x87, 0xe,
    0x1c, 0x38, 0x70, 0xe3, 0x87, 0x1c, 0x71, 0xc3,
    0x0,

    /* U+002A "*" */
    0x10, 0xa1, 0xf8, 0xc7, 0xea, 0x4, 0x0,

    /* U+002B "+" */
    0xe, 0x1, 0xc0, 0x38, 0x7, 0x0, 0xe1, 0xff,
    0xff, 0xf8, 0x70, 0xe, 0x1, 0xc0, 0x38, 0x2,
    0x0,

    /* U+002C "," */
    0x6f, 0x37, 0x60,

    /* U+002D "-" */
    0xff, 0xfc,

    /* U+002E "." */
    0xff, 0x80,

    /* U+002F "/" */
    0x0, 0x0, 0xc, 0x3, 0x80, 0x60, 0x1c, 0x3,
    0x0, 0xe0, 0x18, 0x7, 0x0, 0xc0, 0x38, 0x6,
    0x1, 0xc0, 0x30, 0xe, 0x1, 0x80, 0x70, 0xc,
    0x1, 0x80, 0x70, 0xc, 0x0,

    /* U+0030 "0" */
    0xf, 0x3, 0xfc, 0x79, 0xe7, 0xe, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xe0, 0x7e, 0x7, 0xe0,
    0x77, 0xe, 0x79, 0xe3, 0xfc, 0x1f, 0x0,

    /* U+0031 "1" */
    0xe, 0x3d, 0xfb, 0xf6, 0xe1, 0xc3, 0x87, 0xe,
    0x1c, 0x38, 0x70, 0xe1, 0xc3, 0x80,

    /* U+0032 "2" */
    0x1f, 0x1f, 0xee, 0x3f, 0x7, 0x1, 0xc0, 0x70,
    0x3c, 0x1e, 0x7, 0x83, 0xc1, 0xe0, 0xf0, 0x78,
    0x3f, 0xff, 0xfc,

    /* U+0033 "3" */
    0xff, 0xbf, 0xe0, 0x70, 0x38, 0x1c, 0xf, 0xc3,
    0xf8, 0xe, 0x1, 0xc0, 0x70, 0x1c, 0x7, 0xe3,
    0xbf, 0xc7, 0xe0,

    /* U+0034 "4" */
    0x0, 0xc0, 0x1c, 0x3, 0xc0, 0x7c, 0xf, 0xc1,
    0xdc, 0x39, 0xc3, 0x9c, 0x71, 0xcf, 0xff, 0xff,
    0xf0, 0x1c, 0x1, 0xc0, 0x1c, 0x1, 0xc0,

    /* U+0035 "5" */
    0x3f, 0xcf, 0xf9, 0x80, 0x30, 0x6, 0x0, 0xfe,
    0x1f, 0xf3, 0x8e, 0x0, 0xe0, 0x1c, 0x3, 0x80,
    0x76, 0x3c, 0xff, 0xf, 0xc0,

    /* U+0036 "6" */
    0x7, 0x7, 0xc3, 0xc0, 0xe0, 0x70, 0x1b, 0x8f,
    0xfb, 0xce, 0xe1, 0xf8, 0x7e, 0x1f, 0x87, 0x73,
    0x8f, 0xe1, 0xe0,

    /* U+0037 "7" */
    0xff, 0xff, 0xf0, 0x1c, 0xe, 0x3, 0x81, 0xc0,
    0x70, 0x38, 0xe, 0x3, 0x1, 0xc0, 0x60, 0x38,
    0xe, 0x3, 0x0,

    /* U+0038 "8" */
    0x1e, 0x1f, 0xef, 0x3f, 0x87, 0xe1, 0xfc, 0xf3,
    0xf1, 0xfe, 0xf3, 0xb8, 0x7e, 0x1f, 0x87, 0x73,
    0x9f, 0xe1, 0xe0,

    /* U+0039 "9" */
    0x1e, 0x1f, 0xcf, 0x3b, 0x87, 0xe1, 0xf8, 0x7f,
    0x3d, 0xff, 0x3d, 0xc0, 0xe0, 0x38, 0x1c, 0x1f,
    0xf, 0x83, 0x80,

    /* U+003A ":" */
    0xff, 0x80, 0x0, 0x1f, 0xf0,

    /* U+003B ";" */
    0x73, 0x9c, 0x0, 0x0, 0x0, 0x0, 0x1d, 0xe3,
    0x39, 0x80,

    /* U+003C "<" */
    0x0, 0xc0, 0xf0, 0xf8, 0xf8, 0xf8, 0x3c, 0x7,
    0x80, 0xf8, 0xf, 0x80, 0xf0, 0xc,

    /* U+003D "=" */
    0xff, 0xff, 0xfc, 0x0, 0x0, 0xf, 0xff, 0xff,
    0xc0,

    /* U+003E ">" */
    0xc0, 0x3c, 0x7, 0xc0, 0x7c, 0xf, 0x80, 0xf0,
    0x7c, 0x7c, 0x7c, 0x3c, 0xc, 0x0,

    /* U+003F "?" */
    0x3e, 0x3f, 0xce, 0x38, 0x7, 0x1, 0xc0, 0x70,
    0x1c, 0xe, 0x1f, 0x87, 0x81, 0xc0, 0x70, 0x0,
    0x7, 0x1, 0xc0, 0x70,

    /* U+0040 "@" */
    0x0, 0xff, 0x0, 0x3f, 0xfc, 0xf, 0x1, 0xe1,
    0xce, 0xe6, 0x3b, 0xfe, 0x37, 0x79, 0xe3, 0x67,
    0xc, 0x3c, 0xe0, 0xc3, 0xce, 0x1c, 0x3c, 0xe1,
    0xc6, 0xce, 0x3c, 0xec, 0x7f, 0xfc, 0xc3, 0xcf,
    0x6, 0x0, 0x0, 0x70, 0x0, 0x3, 0x80, 0xe0,
    0x1f, 0xf8, 0x0, 0x7e, 0x0,

    /* U+0041 "A" */
    0x3, 0x0, 0x1e, 0x0, 0x78, 0x1, 0xf0, 0xf,
    0xc0, 0x33, 0x1, 0xce, 0x6, 0x18, 0x38, 0x70,
    0xff, 0xc7, 0xff, 0x9c, 0xe, 0xe0, 0x1f, 0x80,
    0x7c, 0x0, 0xc0,

    /* U+0042 "B" */
    0xff, 0x8f, 0xfc, 0xe0, 0xee, 0xe, 0xe0, 0xee,
    0xc, 0xff, 0x8f, 0xfe, 0xe0, 0xfe, 0x7, 0xe0,
    0x7e, 0x7, 0xe0, 0xff, 0xfe, 0xff, 0xc0,

    /* U+0043 "C" */
    0x7, 0xe0, 0xff, 0x8f, 0xc, 0xe0, 0x7, 0x0,
    0x70, 0x3, 0x80, 0x1c, 0x0, 0xe0, 0x7, 0x0,
    0x1c, 0x0, 0xe0, 0x3, 0xc3, 0xf, 0xf8, 0x1f,
    0x80,

    /* U+0044 "D" */
    0xff, 0x87, 0xff, 0x38, 0x3d, 0xc0, 0xee, 0x3,
    0xf0, 0x1f, 0x80, 0xfc, 0x7, 0xe0, 0x3f, 0x1,
    0xf8, 0xf, 0xc0, 0xee, 0xf, 0x7f, 0xf3, 0xfe,
    0x0,

    /* U+0045 "E" */
    0xff, 0xff, 0xfe, 0x3, 0x80, 0xe0, 0x38, 0xf,
    0xfb, 0xfe, 0xe0, 0x38, 0xe, 0x3, 0x80, 0xe0,
    0x3f, 0xff, 0xfc,

    /* U+0046 "F" */
    0xff, 0xff, 0xfe, 0x3, 0x80, 0xe0, 0x38, 0xf,
    0xfb, 0xfe, 0xe0, 0x38, 0xe, 0x3, 0x80, 0xe0,
    0x38, 0xe, 0x0,

    /* U+0047 "G" */
    0x7, 0xf0, 0x7f, 0xe3, 0xc1, 0x1e, 0x0, 0x70,
    0x3, 0x80, 0xe, 0x0, 0x38, 0x3f, 0xe0, 0xff,
    0x80, 0x77, 0x1, 0xde, 0x7, 0x3c, 0x1c, 0x7f,
    0xf0, 0x7e, 0x0,

    /* U+0048 "H" */
    0xe0, 0x3f, 0x1, 0xf8, 0xf, 0xc0, 0x7e, 0x3,
    0xf0, 0x1f, 0xff, 0xff, 0xff, 0xe0, 0x3f, 0x1,
    0xf8, 0xf, 0xc0, 0x7e, 0x3, 0xf0, 0x1f, 0x80,
    0xe0,

    /* U+0049 "I" */
    0xff, 0xff, 0xff, 0xff, 0xff, 0xf8,

    /* U+004A "J" */
    0x1, 0xc0, 0x70, 0x1c, 0x7, 0x1, 0xc0, 0x70,
    0x1c, 0x7, 0x1, 0xc0, 0x70, 0x1c, 0x7, 0xe3,
    0xbf, 0xc3, 0xe0,

    /* U+004B "K" */
    0xe0, 0x3e, 0x7, 0xe0, 0xee, 0x1c, 0xe3, 0x8e,
    0x70, 0xee, 0xf, 0xf0, 0xff, 0xf, 0x38, 0xe1,
    0xce, 0x1e, 0xe0, 0xfe, 0x7, 0xe0, 0x30,

    /* U+004C "L" */
    0xe0, 0x38, 0xe, 0x3, 0x80, 0xe0, 0x38, 0xe,
    0x3, 0x80, 0xe0, 0x38, 0xe, 0x3, 0x80, 0xe0,
    0x3f, 0xff, 0xfc,

    /* U+004D "M" */
    0xe0, 0x7, 0xc0, 0x1f, 0xc0, 0x7f, 0xc0, 0xff,
    0x83, 0xff, 0x8f, 0xfb, 0xbb, 0xf3, 0x77, 0xe7,
    0xcf, 0xc7, 0x1f, 0x8e, 0x3f, 0x0, 0x7e, 0x0,
    0xfc, 0x1, 0xf8, 0x3, 0x80,

    /* U+004E "N" */
    0xc0, 0x3f, 0x1, 0xfc, 0xf, 0xf0, 0x7f, 0x83,
    0xf6, 0x1f, 0xb8, 0xfc, 0xe7, 0xe3, 0xbf, 0xd,
    0xf8, 0x3f, 0xc1, 0xfe, 0x7, 0xf0, 0x1f, 0x80,
    0x60,

    /* U+004F "O" */
    0x7, 0xc0, 0x3f, 0xe0, 0xf1, 0xe3, 0x80, 0xe7,
    0x1, 0xdc, 0x1, 0xf8, 0x3, 0xf0, 0x7, 0xe0,
    0xf, 0xc0, 0x1d, 0xc0, 0x73, 0x80, 0xe3, 0xc7,
    0x83, 0xfe, 0x1, 0xf0, 0x0,

    /* U+0050 "P" */
    0xff, 0x9f, 0xfb, 0x87, 0xf0, 0x7e, 0xf, 0xc1,
    0xf8, 0x7f, 0xfe, 0xff, 0x9c, 0x3, 0x80, 0x70,
    0xe, 0x1, 0xc0, 0x38, 0x0,

    /* U+0051 "Q" */
    0x7, 0xc0, 0x1f, 0xf0, 0x3c, 0x78, 0x70, 0x1c,
    0x70, 0x1c, 0xe0, 0xe, 0xe0, 0xe, 0xe0, 0xe,
    0xe0, 0xe, 0xe0, 0xe, 0x70, 0x1c, 0x70, 0x1c,
    0x3c, 0x78, 0x1f, 0xf0, 0x7, 0xc0, 0xf, 0x0,
    0x1f, 0xc7, 0x1f, 0xff, 0x0, 0x7c,

    /* U+0052 "R" */
    0xff, 0xc7, 0xff, 0x38, 0x3d, 0xc0, 0xee, 0x7,
    0x70, 0x3b, 0x83, 0x9f, 0xf8, 0xff, 0xc7, 0x7,
    0x38, 0x19, 0xc0, 0xce, 0x7, 0x70, 0x3f, 0x80,
    0x40,

    /* U+0053 "S" */
    0x1f, 0xf, 0xfb, 0xc3, 0xf0, 0xe, 0x1, 0xe0,
    0x3f, 0xc3, 0xfe, 0x1f, 0xe0, 0x3c, 0x3, 0xa0,
    0x7e, 0x1e, 0xff, 0x8f, 0xc0,

    /* U+0054 "T" */
    0xff, 0xf7, 0xff, 0x81, 0xc0, 0xe, 0x0, 0x70,
    0x3, 0x80, 0x1c, 0x0, 0xe0, 0x7, 0x0, 0x38,
    0x1, 0xc0, 0xe, 0x0, 0x70, 0x3, 0x80, 0x1c,
    0x0,

    /* U+0055 "U" */
    0xe0, 0x7e, 0x7, 0xe0, 0x7e, 0x7, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xe0, 0x7e, 0x7, 0xe0,
    0x7f, 0xf, 0x71, 0xe3, 0xfc, 0x1f, 0x80,

    /* U+0056 "V" */
    0xc0, 0xf, 0x80, 0x7e, 0x1, 0xdc, 0xe, 0x70,
    0x38, 0xe1, 0xc3, 0x87, 0x7, 0x18, 0x1c, 0xe0,
    0x3b, 0x0, 0xfc, 0x1, 0xe0, 0x7, 0x80, 0x1e,
    0x0, 0x30, 0x0,

    /* U+0057 "W" */
    0xe0, 0x0, 0x7e, 0x0, 0x7, 0xe0, 0x0, 0x77,
    0x6, 0xe, 0x70, 0x70, 0xe7, 0xf, 0xe, 0x38,
    0xf1, 0xc3, 0x9f, 0x9c, 0x39, 0x99, 0xc1, 0xf9,
    0xf8, 0x1f, 0x9f, 0x81, 0xf0, 0xf8, 0xf, 0xf,
    0x0, 0xe0, 0x70, 0x6, 0x6, 0x0,

    /* U+0058 "X" */
    0xc0, 0x3e, 0x7, 0x70, 0xe7, 0x8e, 0x39, 0xc1,
    0xf8, 0xf, 0x0, 0xf0, 0xf, 0x1, 0xf8, 0x39,
    0xc7, 0x1e, 0x70, 0xee, 0x7, 0xc0, 0x30,

    /* U+0059 "Y" */
    0xe0, 0x3e, 0x7, 0x70, 0x77, 0x8e, 0x3d, 0xc1,
    0xdc, 0xf, 0x80, 0xf8, 0x7, 0x0, 0x70, 0x7,
    0x0, 0x70, 0x7, 0x0, 0x70, 0x7, 0x0,

    /* U+005A "Z" */
    0x7f, 0xfb, 0xff, 0xc0, 0x3c, 0x3, 0xe0, 0x1e,
    0x1, 0xe0, 0x1e, 0x1, 0xe0, 0xf, 0x0, 0xf0,
    0xf, 0x0, 0xf0, 0x7, 0x0, 0x7f, 0xfb, 0xff,
    0xc0,

    /* U+005B "[" */
    0xff, 0xff, 0x87, 0xe, 0x1c, 0x38, 0x70, 0xe1,
    0xc3, 0x87, 0xe, 0x1c, 0x38, 0x70, 0xe1, 0xff,
    0xf8,

    /* U+005C "\\" */
    0x0, 0x18, 0x3, 0x80, 0x30, 0x7, 0x0, 0x60,
    0xe, 0x0, 0xc0, 0x1c, 0x1, 0x80, 0x38, 0x3,
    0x0, 0x70, 0x6, 0x0, 0xe0, 0xc, 0x1, 0x80,
    0x18, 0x3, 0x0, 0x70, 0x6,

    /* U+005D "]" */
    0xff, 0xfc, 0x38, 0x70, 0xe1, 0xc3, 0x87, 0xe,
    0x1c, 0x38, 0x70, 0xe1, 0xc3, 0x87, 0xf, 0xff,
    0xf8,

    /* U+005E "^" */
    0x4, 0x1, 0xc0, 0x7c, 0x1d, 0xc3, 0xb8, 0xe3,
    0x9c, 0x77, 0x7, 0xc0, 0x60,

    /* U+005F "_" */
    0xff, 0xff, 0xff, 0xc0,

    /* U+0060 "`" */
    0x7, 0x3c, 0x60,

    /* U+0061 "a" */
    0x1f, 0x73, 0xff, 0x71, 0xff, 0xf, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xf0, 0xf7, 0xf, 0x3f,
    0xf1, 0xf7,

    /* U+0062 "b" */
    0xe0, 0xe, 0x0, 0xe0, 0xe, 0x0, 0xef, 0x8f,
    0xfc, 0xf8, 0xef, 0xf, 0xe0, 0x7e, 0x7, 0xe0,
    0x7e, 0x7, 0xf0, 0xff, 0xe, 0xff, 0xce, 0xf8,

    /* U+0063 "c" */
    0x1f, 0x8f, 0xf7, 0x8f, 0xc0, 0xe0, 0x38, 0xe,
    0x3, 0x80, 0xf0, 0x1e, 0x33, 0xfc, 0x7e,

    /* U+0064 "d" */
    0x0, 0x70, 0x7, 0x0, 0x70, 0x7, 0x1f, 0x73,
    0xff, 0x71, 0xff, 0xf, 0xe0, 0x7e, 0x7, 0xe0,
    0x7e, 0x7, 0xf0, 0xf7, 0xf, 0x3f, 0xf1, 0xf7,

    /* U+0065 "e" */
    0x1f, 0x7, 0xf1, 0xc7, 0x70, 0x7e, 0xf, 0xff,
    0xff, 0xff, 0x0, 0xf0, 0xf, 0x18, 0xff, 0xf,
    0x80,

    /* U+0066 "f" */
    0x7, 0x83, 0xe1, 0xc0, 0x70, 0x7f, 0x9f, 0xe1,
    0xc0, 0x70, 0x1c, 0x7, 0x1, 0xc0, 0x70, 0x1c,
    0x7, 0x1, 0xc0, 0x70,

    /* U+0067 "g" */
    0x1f, 0x73, 0xff, 0x71, 0xff, 0xf, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xf0, 0xf7, 0xf, 0x3f,
    0xf1, 0xf7, 0x0, 0x73, 0xe, 0x7f, 0xc1, 0xf8,

    /* U+0068 "h" */
    0xe0, 0x38, 0xe, 0x3, 0x80, 0xef, 0x3f, 0xef,
    0x3f, 0x87, 0xe1, 0xf8, 0x7e, 0x1f, 0x87, 0xe1,
    0xf8, 0x7e, 0x1f, 0x87,

    /* U+0069 "i" */
    0xfc, 0x7f, 0xff, 0xff, 0xff, 0xf8,

    /* U+006A "j" */
    0x39, 0xc0, 0x73, 0x9c, 0xe7, 0x39, 0xce, 0x73,
    0x9c, 0xe7, 0x7f, 0xb8,

    /* U+006B "k" */
    0xe0, 0x38, 0xe, 0x3, 0x80, 0xe1, 0xb8, 0xee,
    0x7b, 0xbc, 0xee, 0x3f, 0xf, 0xe3, 0xfc, 0xe7,
    0xb8, 0xee, 0x1f, 0x83,

    /* U+006C "l" */
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff,

    /* U+006D "m" */
    0xef, 0x1e, 0x7f, 0xdf, 0xbc, 0xf9, 0xfc, 0x38,
    0x7e, 0x1c, 0x3f, 0xe, 0x1f, 0x87, 0xf, 0xc3,
    0x87, 0xe1, 0xc3, 0xf0, 0xe1, 0xf8, 0x70, 0xfc,
    0x38, 0x70,

    /* U+006E "n" */
    0xef, 0x3f, 0xef, 0x3f, 0x87, 0xe1, 0xf8, 0x7e,
    0x1f, 0x87, 0xe1, 0xf8, 0x7e, 0x1f, 0x87,

    /* U+006F "o" */
    0xf, 0x3, 0xfc, 0x71, 0xef, 0xe, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xf0, 0xf7, 0x8e, 0x3f,
    0xc1, 0xf8,

    /* U+0070 "p" */
    0xef, 0x8f, 0xfc, 0xf8, 0xef, 0xf, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xf0, 0xff, 0xe, 0xff,
    0xce, 0xf8, 0xe0, 0xe, 0x0, 0xe0, 0xe, 0x0,

    /* U+0071 "q" */
    0x1f, 0x73, 0xff, 0x71, 0xff, 0xf, 0xe0, 0x7e,
    0x7, 0xe0, 0x7e, 0x7, 0xf0, 0xf7, 0xf, 0x3f,
    0xf1, 0xf7, 0x0, 0x70, 0x7, 0x0, 0x70, 0x7,

    /* U+0072 "r" */
    0xee, 0xfe, 0xf0, 0xe0, 0xe0, 0xe0, 0xe0, 0xe0,
    0xe0, 0xe0, 0xe0, 0xe0,

    /* U+0073 "s" */
    0x1f, 0xf, 0xf7, 0x1d, 0xc0, 0x78, 0xf, 0xc1,
    0xf8, 0xf, 0x41, 0xf8, 0x77, 0xf8, 0xfc,

    /* U+0074 "t" */
    0x0, 0x38, 0x38, 0xfe, 0xfe, 0x38, 0x38, 0x38,
    0x38, 0x38, 0x38, 0x38, 0x38, 0x3e, 0x1e,

    /* U+0075 "u" */
    0xe1, 0xf8, 0x7e, 0x1f, 0x87, 0xe1, 0xf8, 0x7e,
    0x1f, 0x87, 0xe1, 0xfc, 0xe7, 0xf8, 0xf8,

    /* U+0076 "v" */
    0xc0, 0x7c, 0x1f, 0x83, 0xb8, 0x67, 0x1c, 0x73,
    0xe, 0xe0, 0xd8, 0x1f, 0x1, 0xe0, 0x38, 0x7,
    0x0,

    /* U+0077 "w" */
    0xc0, 0x3, 0xe0, 0x7, 0xe1, 0x87, 0x73, 0xce,
    0x73, 0xce, 0x73, 0xce, 0x3f, 0xfc, 0x3e, 0x7c,
    0x1e, 0x78, 0x1e, 0x78, 0x1c, 0x38, 0xc, 0x30,

    /* U+0078 "x" */
    0xc0, 0xf8, 0x77, 0x39, 0xfe, 0x3f, 0x7, 0x81,
    0xe0, 0xfc, 0x7f, 0x9c, 0xee, 0x1f, 0x3,

    /* U+0079 "y" */
    0xe1, 0xf8, 0x7e, 0x1f, 0x87, 0xe1, 0xf8, 0x7e,
    0x1f, 0x87, 0xe1, 0xfc, 0xf7, 0xfc, 0xf7, 0x1,
    0xd0, 0xef, 0xf1, 0xf8,

    /* U+007A "z" */
    0xff, 0xbf, 0xf0, 0x38, 0x1c, 0xf, 0x7, 0x81,
    0xc0, 0xf0, 0x78, 0x3c, 0xf, 0xff, 0xff,

    /* U+007B "{" */
    0x3, 0xf, 0x1e, 0x1c, 0x1c, 0x1c, 0x1c, 0x1c,
    0x3c, 0xf8, 0xf0, 0x3c, 0x1c, 0x1c, 0x1c, 0x1c,
    0x1c, 0x1e, 0xf, 0x7,

    /* U+007C "|" */
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xf0,

    /* U+007D "}" */
    0xe0, 0x7c, 0xf, 0x3, 0x81, 0xc0, 0xe0, 0x70,
    0x38, 0xf, 0x7, 0x87, 0x83, 0x81, 0xc0, 0xe0,
    0x70, 0x38, 0x3c, 0x7c, 0x38, 0x0,

    /* U+007E "~" */
    0x70, 0xff, 0x3c, 0xff, 0xe
};


/*---------------------
 *  GLYPH DESCRIPTION
 *--------------------*/

static const lv_font_fmt_txt_glyph_dsc_t glyph_dsc[] = {
    {.bitmap_index = 0, .adv_w = 0, .box_w = 0, .box_h = 0, .ofs_x = 0, .ofs_y = 0} /* id = 0 reserved */,
    {.bitmap_index = 0, .adv_w = 99, .box_w = 1, .box_h = 1, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 1, .adv_w = 94, .box_w = 3, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 7, .adv_w = 151, .box_w = 8, .box_h = 6, .ofs_x = 1, .ofs_y = 9},
    {.bitmap_index = 13, .adv_w = 244, .box_w = 14, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 40, .adv_w = 210, .box_w = 11, .box_h = 21, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 69, .adv_w = 287, .box_w = 17, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 101, .adv_w = 250, .box_w = 15, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 130, .adv_w = 75, .box_w = 3, .box_h = 6, .ofs_x = 1, .ofs_y = 9},
    {.bitmap_index = 133, .adv_w = 126, .box_w = 7, .box_h = 19, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 150, .adv_w = 126, .box_w = 7, .box_h = 19, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 167, .adv_w = 128, .box_w = 7, .box_h = 7, .ofs_x = 0, .ofs_y = 8},
    {.bitmap_index = 174, .adv_w = 203, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 1},
    {.bitmap_index = 191, .adv_w = 97, .box_w = 4, .box_h = 5, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 194, .adv_w = 139, .box_w = 7, .box_h = 2, .ofs_x = 1, .ofs_y = 5},
    {.bitmap_index = 196, .adv_w = 88, .box_w = 3, .box_h = 3, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 198, .adv_w = 200, .box_w = 11, .box_h = 21, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 227, .adv_w = 216, .box_w = 12, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 250, .adv_w = 137, .box_w = 7, .box_h = 15, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 264, .adv_w = 200, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 283, .adv_w = 189, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 302, .adv_w = 207, .box_w = 12, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 325, .adv_w = 203, .box_w = 11, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 346, .adv_w = 195, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 365, .adv_w = 193, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 384, .adv_w = 193, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 403, .adv_w = 200, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 422, .adv_w = 96, .box_w = 3, .box_h = 12, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 427, .adv_w = 103, .box_w = 5, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 437, .adv_w = 185, .box_w = 10, .box_h = 11, .ofs_x = 1, .ofs_y = 2},
    {.bitmap_index = 451, .adv_w = 218, .box_w = 11, .box_h = 6, .ofs_x = 1, .ofs_y = 4},
    {.bitmap_index = 460, .adv_w = 185, .box_w = 10, .box_h = 11, .ofs_x = 1, .ofs_y = 2},
    {.bitmap_index = 474, .adv_w = 186, .box_w = 10, .box_h = 16, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 494, .adv_w = 339, .box_w = 20, .box_h = 18, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 539, .adv_w = 225, .box_w = 14, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 566, .adv_w = 231, .box_w = 12, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 589, .adv_w = 221, .box_w = 13, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 614, .adv_w = 252, .box_w = 13, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 639, .adv_w = 201, .box_w = 10, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 658, .adv_w = 198, .box_w = 10, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 677, .adv_w = 245, .box_w = 14, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 704, .adv_w = 253, .box_w = 13, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 729, .adv_w = 97, .box_w = 3, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 735, .adv_w = 194, .box_w = 10, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 754, .adv_w = 231, .box_w = 12, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 777, .adv_w = 198, .box_w = 10, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 796, .adv_w = 288, .box_w = 15, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 825, .adv_w = 259, .box_w = 13, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 850, .adv_w = 267, .box_w = 15, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 879, .adv_w = 212, .box_w = 11, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 900, .adv_w = 266, .box_w = 16, .box_h = 19, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 938, .adv_w = 242, .box_w = 13, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 963, .adv_w = 210, .box_w = 11, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 984, .adv_w = 220, .box_w = 13, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1009, .adv_w = 248, .box_w = 12, .box_h = 15, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 1032, .adv_w = 239, .box_w = 14, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1059, .adv_w = 332, .box_w = 20, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1097, .adv_w = 231, .box_w = 12, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1120, .adv_w = 210, .box_w = 12, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1143, .adv_w = 228, .box_w = 13, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1168, .adv_w = 143, .box_w = 7, .box_h = 19, .ofs_x = 2, .ofs_y = -4},
    {.bitmap_index = 1185, .adv_w = 200, .box_w = 11, .box_h = 21, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 1214, .adv_w = 143, .box_w = 7, .box_h = 19, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1231, .adv_w = 218, .box_w = 11, .box_h = 9, .ofs_x = 1, .ofs_y = 7},
    {.bitmap_index = 1244, .adv_w = 248, .box_w = 13, .box_h = 2, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1248, .adv_w = 91, .box_w = 5, .box_h = 4, .ofs_x = 1, .ofs_y = 13},
    {.bitmap_index = 1251, .adv_w = 221, .box_w = 12, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1269, .adv_w = 221, .box_w = 12, .box_h = 16, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1293, .adv_w = 183, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1308, .adv_w = 221, .box_w = 12, .box_h = 16, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1332, .adv_w = 208, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1349, .adv_w = 154, .box_w = 10, .box_h = 16, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 1369, .adv_w = 225, .box_w = 12, .box_h = 16, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1393, .adv_w = 206, .box_w = 10, .box_h = 16, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1413, .adv_w = 83, .box_w = 3, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1419, .adv_w = 97, .box_w = 5, .box_h = 19, .ofs_x = 0, .ofs_y = -4},
    {.bitmap_index = 1431, .adv_w = 200, .box_w = 10, .box_h = 16, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 1451, .adv_w = 95, .box_w = 3, .box_h = 16, .ofs_x = 2, .ofs_y = 0},
    {.bitmap_index = 1457, .adv_w = 325, .box_w = 17, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1483, .adv_w = 210, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1498, .adv_w = 220, .box_w = 12, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1516, .adv_w = 221, .box_w = 12, .box_h = 16, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1540, .adv_w = 221, .box_w = 12, .box_h = 16, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1564, .adv_w = 153, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1576, .adv_w = 170, .box_w = 10, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 1591, .adv_w = 144, .box_w = 8, .box_h = 15, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1606, .adv_w = 207, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1621, .adv_w = 198, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1638, .adv_w = 270, .box_w = 16, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1662, .adv_w = 171, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1677, .adv_w = 207, .box_w = 10, .box_h = 16, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1697, .adv_w = 170, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 1712, .adv_w = 141, .box_w = 8, .box_h = 20, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1732, .adv_w = 87, .box_w = 3, .box_h = 20, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 1740, .adv_w = 141, .box_w = 9, .box_h = 19, .ofs_x = 1, .ofs_y = -4},
    {.bitmap_index = 1762, .adv_w = 190, .box_w = 10, .box_h = 4, .ofs_x = 1, .ofs_y = 5}
};

/*---------------------
 *  CHARACTER MAPPING
 *--------------------*/



/*Collect the unicode lists and glyph_id offsets*/
static const lv_font_fmt_txt_cmap_t cmaps[] =
{
    {
        .range_start = 32, .range_length = 95, .glyph_id_start = 1,
        .unicode_list = NULL, .glyph_id_ofs_list = NULL, .list_length = 0, .type = LV_FONT_FMT_TXT_CMAP_FORMAT0_TINY
    }
};

/*-----------------
 *    KERNING
 *----------------*/


/*Pair left and right glyphs for kerning*/
static const uint8_t kern_pair_glyph_ids[] =
{
    7, 10,
    12, 18,
    13, 18,
    13, 75,
    14, 18,
    15, 18,
    15, 21,
    16, 16,
    17, 24,
    17, 34,
    17, 43,
    17, 53,
    17, 55,
    17, 56,
    17, 57,
    17, 58,
    17, 59,
    17, 68,
    17, 69,
    17, 70,
    17, 80,
    17, 82,
    17, 89,
    17, 91,
    21, 18,
    21, 24,
    21, 26,
    22, 15,
    23, 18,
    24, 13,
    24, 15,
    24, 18,
    24, 21,
    24, 23,
    24, 36,
    24, 40,
    24, 48,
    24, 50,
    26, 13,
    26, 15,
    26, 24,
    31, 18,
    34, 36,
    34, 40,
    34, 48,
    34, 50,
    34, 53,
    34, 54,
    34, 55,
    34, 56,
    34, 58,
    34, 66,
    34, 85,
    34, 86,
    34, 87,
    34, 88,
    34, 90,
    35, 53,
    35, 55,
    35, 56,
    35, 57,
    35, 58,
    35, 67,
    35, 68,
    35, 69,
    35, 70,
    35, 72,
    35, 73,
    35, 76,
    35, 77,
    35, 80,
    35, 82,
    35, 89,
    37, 24,
    37, 34,
    37, 43,
    37, 53,
    37, 55,
    37, 56,
    37, 57,
    37, 58,
    37, 59,
    37, 68,
    37, 69,
    37, 70,
    37, 80,
    37, 82,
    37, 89,
    37, 91,
    38, 43,
    38, 68,
    38, 69,
    38, 70,
    38, 72,
    38, 80,
    38, 82,
    38, 86,
    38, 87,
    38, 90,
    39, 34,
    39, 36,
    39, 40,
    39, 43,
    39, 48,
    39, 50,
    39, 52,
    39, 53,
    39, 57,
    39, 66,
    39, 68,
    39, 69,
    39, 70,
    39, 72,
    39, 78,
    39, 79,
    39, 80,
    39, 81,
    39, 82,
    39, 83,
    39, 84,
    39, 86,
    39, 87,
    39, 89,
    39, 91,
    40, 53,
    40, 55,
    40, 56,
    40, 58,
    40, 66,
    43, 34,
    44, 36,
    44, 40,
    44, 43,
    44, 48,
    44, 50,
    44, 52,
    44, 54,
    44, 55,
    44, 56,
    44, 58,
    44, 68,
    44, 69,
    44, 70,
    44, 78,
    44, 79,
    44, 80,
    44, 81,
    44, 82,
    44, 83,
    44, 84,
    44, 85,
    44, 86,
    44, 87,
    44, 88,
    44, 90,
    45, 36,
    45, 40,
    45, 48,
    45, 50,
    45, 53,
    45, 54,
    45, 55,
    45, 56,
    45, 58,
    45, 85,
    45, 87,
    45, 88,
    45, 90,
    45, 91,
    48, 24,
    48, 34,
    48, 43,
    48, 53,
    48, 55,
    48, 56,
    48, 57,
    48, 58,
    48, 59,
    48, 68,
    48, 69,
    48, 70,
    48, 80,
    48, 82,
    48, 89,
    48, 91,
    49, 13,
    49, 15,
    49, 34,
    49, 43,
    49, 56,
    49, 57,
    49, 59,
    49, 66,
    49, 68,
    49, 69,
    49, 70,
    49, 71,
    49, 72,
    49, 80,
    49, 82,
    49, 85,
    49, 86,
    49, 87,
    49, 88,
    49, 90,
    50, 24,
    50, 34,
    50, 43,
    50, 53,
    50, 55,
    50, 56,
    50, 57,
    50, 58,
    50, 59,
    50, 68,
    50, 69,
    50, 70,
    50, 80,
    50, 82,
    50, 89,
    50, 91,
    51, 36,
    51, 40,
    51, 48,
    51, 50,
    51, 53,
    51, 54,
    51, 55,
    51, 56,
    51, 58,
    51, 66,
    51, 68,
    51, 69,
    51, 70,
    51, 80,
    51, 82,
    51, 86,
    52, 57,
    52, 58,
    53, 15,
    53, 34,
    53, 36,
    53, 40,
    53, 43,
    53, 48,
    53, 50,
    53, 53,
    53, 55,
    53, 56,
    53, 58,
    53, 66,
    53, 68,
    53, 69,
    53, 70,
    53, 72,
    53, 78,
    53, 79,
    53, 80,
    53, 81,
    53, 82,
    53, 83,
    53, 84,
    53, 86,
    53, 87,
    53, 88,
    53, 89,
    53, 90,
    53, 91,
    54, 34,
    54, 43,
    54, 52,
    54, 57,
    54, 58,
    54, 89,
    55, 34,
    55, 36,
    55, 40,
    55, 43,
    55, 48,
    55, 50,
    55, 52,
    55, 53,
    55, 66,
    55, 68,
    55, 69,
    55, 70,
    55, 72,
    55, 78,
    55, 79,
    55, 80,
    55, 81,
    55, 82,
    55, 83,
    55, 84,
    55, 86,
    55, 91,
    56, 34,
    56, 36,
    56, 40,
    56, 43,
    56, 48,
    56, 50,
    56, 52,
    56, 53,
    56, 66,
    56, 68,
    56, 69,
    56, 70,
    56, 72,
    56, 78,
    56, 79,
    56, 80,
    56, 81,
    56, 82,
    56, 83,
    56, 86,
    57, 36,
    57, 40,
    57, 48,
    57, 50,
    57, 52,
    57, 54,
    57, 68,
    57, 69,
    57, 70,
    57, 72,
    57, 80,
    57, 82,
    57, 86,
    57, 87,
    57, 88,
    57, 90,
    58, 34,
    58, 36,
    58, 40,
    58, 43,
    58, 48,
    58, 50,
    58, 52,
    58, 53,
    58, 54,
    58, 66,
    58, 68,
    58, 69,
    58, 70,
    58, 72,
    58, 78,
    58, 79,
    58, 80,
    58, 81,
    58, 82,
    58, 83,
    58, 84,
    58, 86,
    58, 87,
    58, 88,
    58, 89,
    58, 90,
    58, 91,
    59, 36,
    59, 40,
    59, 48,
    59, 50,
    59, 68,
    59, 69,
    59, 70,
    59, 80,
    59, 82,
    59, 86,
    59, 87,
    61, 61,
    66, 34,
    66, 36,
    66, 40,
    66, 48,
    66, 50,
    66, 53,
    66, 54,
    66, 55,
    66, 56,
    66, 58,
    66, 66,
    66, 86,
    66, 87,
    66, 88,
    67, 53,
    67, 55,
    67, 56,
    67, 57,
    67, 58,
    67, 59,
    67, 87,
    67, 91,
    68, 53,
    68, 55,
    68, 56,
    68, 57,
    68, 58,
    69, 86,
    70, 53,
    70, 55,
    70, 56,
    70, 57,
    70, 58,
    70, 66,
    70, 72,
    70, 87,
    70, 90,
    71, 34,
    71, 53,
    71, 55,
    71, 56,
    71, 57,
    71, 58,
    71, 59,
    71, 68,
    71, 69,
    71, 70,
    71, 80,
    71, 82,
    71, 85,
    71, 87,
    71, 88,
    71, 91,
    72, 13,
    72, 34,
    72, 36,
    72, 40,
    72, 48,
    72, 50,
    72, 52,
    72, 58,
    72, 66,
    72, 68,
    72, 69,
    72, 70,
    72, 75,
    72, 80,
    72, 82,
    72, 84,
    72, 86,
    73, 53,
    73, 55,
    73, 58,
    73, 87,
    73, 90,
    74, 53,
    75, 53,
    75, 54,
    75, 75,
    76, 36,
    76, 40,
    76, 48,
    76, 50,
    76, 58,
    76, 66,
    76, 67,
    76, 68,
    76, 69,
    76, 70,
    76, 73,
    76, 75,
    76, 76,
    76, 77,
    76, 80,
    76, 82,
    76, 84,
    76, 86,
    77, 36,
    77, 40,
    77, 48,
    77, 50,
    77, 53,
    77, 55,
    77, 56,
    77, 58,
    77, 68,
    77, 69,
    77, 70,
    77, 72,
    77, 75,
    77, 80,
    77, 82,
    77, 85,
    77, 86,
    77, 87,
    77, 88,
    77, 90,
    78, 53,
    78, 55,
    78, 58,
    78, 87,
    78, 90,
    79, 53,
    79, 55,
    79, 58,
    79, 87,
    79, 90,
    80, 53,
    80, 55,
    80, 56,
    80, 57,
    80, 58,
    80, 59,
    80, 87,
    80, 91,
    81, 53,
    81, 55,
    81, 56,
    81, 57,
    81, 58,
    81, 59,
    81, 87,
    81, 91,
    82, 53,
    82, 55,
    82, 58,
    83, 15,
    83, 34,
    83, 53,
    83, 57,
    83, 66,
    83, 68,
    83, 69,
    83, 70,
    83, 72,
    83, 75,
    83, 80,
    83, 82,
    83, 87,
    83, 88,
    84, 36,
    84, 40,
    84, 48,
    84, 50,
    84, 53,
    84, 55,
    84, 57,
    84, 58,
    84, 66,
    84, 89,
    85, 68,
    85, 69,
    85, 70,
    85, 71,
    85, 72,
    85, 80,
    85, 82,
    85, 84,
    85, 88,
    86, 53,
    86, 55,
    86, 56,
    86, 58,
    86, 72,
    87, 34,
    87, 53,
    87, 57,
    87, 58,
    87, 59,
    87, 66,
    87, 68,
    87, 69,
    87, 70,
    87, 72,
    87, 80,
    87, 82,
    87, 84,
    87, 85,
    87, 87,
    88, 34,
    88, 53,
    88, 57,
    88, 58,
    88, 59,
    88, 66,
    88, 84,
    88, 85,
    88, 87,
    89, 36,
    89, 40,
    89, 48,
    89, 50,
    89, 53,
    89, 54,
    89, 58,
    89, 84,
    89, 85,
    89, 86,
    90, 34,
    90, 53,
    90, 57,
    90, 58,
    90, 59,
    90, 68,
    90, 69,
    90, 70,
    90, 72,
    90, 80,
    90, 82,
    90, 84,
    91, 53,
    91, 58,
    91, 68,
    91, 69,
    91, 70,
    91, 80,
    91, 82,
    95, 18
};

/* Kerning between the respective left and right glyphs
 * 4.4 format which needs to scaled with `kern_scale`*/
static const int8_t kern_pair_values[] =
{
    -5, -14, -25, 2, -14, -18, -11, -32,
    -14, -2, -5, -7, -4, -2, -11, -9,
    -5, 3, 3, 3, 3, 3, -4, 0,
    -11, -11, -7, -14, -7, -11, -25, 14,
    -14, -11, -7, -7, -7, -7, -7, -14,
    -11, -11, -2, -2, -2, -2, -18, -4,
    -32, -8, -15, 7, -2, -4, -10, -3,
    -9, -5, -3, -2, -4, -8, -1, 0,
    0, 0, -2, -1, -1, -1, 0, 0,
    -1, -14, -2, -5, -7, -4, -2, -11,
    -9, -5, 3, 3, 3, 3, 3, -4,
    0, -4, -2, -2, -2, -4, -2, -2,
    -4, -5, -4, -11, -3, -3, -42, -3,
    -3, -2, 5, -2, -7, -5, -5, -5,
    -4, -3, -3, -5, -3, -5, -3, -4,
    -5, -2, -5, -2, -9, -5, -4, -8,
    5, -5, -11, -11, -2, -11, -11, -4,
    -5, -2, -2, 7, -7, -7, -7, -3,
    -3, -7, -3, -7, -3, -1, -1, -4,
    -2, -5, -7, -4, -4, -4, -4, -35,
    -7, -18, -11, -21, -2, -8, -2, -8,
    7, -14, -2, -5, -7, -4, -2, -11,
    -9, -5, 3, 3, 3, 3, 3, -4,
    0, -35, -35, -14, -26, 3, -5, -5,
    -2, -4, -4, -4, 3, -4, -4, -4,
    5, -2, 4, 5, 4, -14, -2, -5,
    -7, -4, -2, -11, -9, -5, 3, 3,
    3, 3, 3, -4, 0, -4, -4, -4,
    -4, -5, -2, -5, 0, -7, 1, -2,
    -2, -2, -2, -2, -4, -5, -5, -35,
    -18, -7, -7, -23, -7, -7, 11, 4,
    4, 4, -35, -42, -42, -42, -16, -21,
    -21, -42, -7, -42, -21, -35, -42, -4,
    -42, -5, -4, -42, -4, -4, -4, -4,
    -4, -2, -12, -4, -4, -19, -4, -4,
    -4, 4, -5, -8, -8, -8, -7, -5,
    -5, -8, -5, -8, -5, -5, -4, -2,
    -8, -2, -2, -11, -2, -2, -4, 4,
    -3, -5, -5, -5, -7, -1, -1, -5,
    -1, -5, -1, -4, -10, -10, -10, -10,
    -5, -4, -6, -6, -6, -1, -6, -6,
    -4, -9, -6, -8, -15, -9, -9, -25,
    -9, -9, -9, 4, -4, -11, -14, -14,
    -14, -13, -8, -8, -14, -7, -14, -8,
    -13, -7, -4, -4, -7, -4, -4, -2,
    -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -32, 7, -7, -7, -7, -7,
    -23, -4, -10, -4, -19, 4, -4, -4,
    -2, -17, -8, -5, -6, -14, -4, -2,
    -4, -11, -5, -4, -2, -12, 6, -16,
    -7, -4, -4, -12, 1, -2, -2, -2,
    -7, 21, 19, 18, 18, 18, 18, -11,
    -11, -11, -11, -11, 1, 4, 1, 1,
    -1, -5, -4, -4, -4, -4, -2, -5,
    -2, -7, -7, -7, 4, -7, -7, -4,
    -3, -11, -5, -9, -2, -2, -11, -11,
    -4, 2, -4, -4, -4, -4, -7, -1,
    -2, -8, -8, -8, -2, -2, -2, -2,
    -8, -8, -2, -2, -7, -7, -7, -7,
    -9, -11, -7, -11, -4, -4, -4, -4,
    -5, -4, -4, -1, -2, -9, -5, -5,
    -11, -5, -9, -2, -2, -11, -5, -9,
    -2, -2, -17, -8, -5, -6, -14, -4,
    -2, -4, -17, -8, -5, -6, -14, -4,
    -2, -4, -7, -4, -5, -42, -11, -4,
    -5, -4, -8, -8, -8, -5, -4, -8,
    -8, 18, 18, -2, -2, -2, -2, -16,
    -2, -2, -7, 3, -2, -2, -2, -2,
    -9, -2, -2, -2, 7, 14, -11, -4,
    -4, -5, -4, -9, -4, -9, -4, -7,
    -1, -2, -2, -2, -2, -2, -2, -2,
    18, 18, -2, -4, -6, -4, -2, 1,
    -2, 18, 14, -4, -4, -4, -4, -5,
    -2, -7, -2, 18, -2, -9, -4, -7,
    -4, -4, -2, -2, -2, -5, -2, -2,
    -4, -4, -4, -4, -4, -4, -4, -4,
    -14
};

/*Collect the kern pair's data in one place*/
static const lv_font_fmt_txt_kern_pair_t kern_pairs =
{
    .glyph_ids = kern_pair_glyph_ids,
    .values = kern_pair_values,
    .pair_cnt = 609,
    .glyph_ids_size = 0
};

/*--------------------
 *  ALL CUSTOM DATA
 *--------------------*/

#if LV_VERSION_CHECK(8, 0, 0)
/*Store all the custom data of the font*/
static  lv_font_fmt_txt_glyph_cache_t cache;
static const lv_font_fmt_txt_dsc_t font_dsc = {
#else
static lv_font_fmt_txt_dsc_t font_dsc = {
#endif
    .glyph_bitmap = glyph_bitmap,
    .glyph_dsc = glyph_dsc,
    .cmaps = cmaps,
    .kern_dsc = &kern_pairs,
    .kern_scale = 16,
    .cmap_num = 1,
    .bpp = 1,
    .kern_classes = 0,
    .bitmap_format = 0,
#if LV_VERSION_CHECK(8, 0, 0)
    .cache = &cache
#endif
};


/*-----------------
 *  PUBLIC FONT
 *----------------*/

/*Initialize a public general font descriptor*/
#if LV_VERSION_CHECK(8, 0, 0)
const lv_font_t ui_font_large = {
#else
lv_font_t ui_font_large = {
#endif
    .get_glyph_dsc = lv_font_get_glyph_dsc_fmt_txt,    /*Function pointer to get glyph's data*/
    .get_glyph_bitmap = lv_font_get_bitmap_fmt_txt,    /*Function pointer to get glyph's bitmap*/
    .line_height = 22,          /*The maximum line height required by the font*/
    .base_line = 4,             /*Baseline measured from the bottom of the line*/
#if !(LVGL_VERSION_MAJOR == 6 && LVGL_VERSION_MINOR == 0)
    .subpx = LV_FONT_SUBPX_NONE,
#endif
#if LV_VERSION_CHECK(7, 4, 0) || LVGL_VERSION_MAJOR >= 8
    .underline_position = -2,
    .underline_thickness = 1,
#endif
    .dsc = &font_dsc           /*The custom font data. Will be accessed by `get_glyph_bitmap/dsc` */
};



#endif /*#if UI_FONT_LARGE*/

