/*******************************************************************************
 * Size: 16 px
 * Bpp: 1
 * Opts: --bpp 1 --size 16 --font C:\Users\Danko\Documents\ArduinoWaveSpeaker\examples\winamp\assets\Quicksand-Bold.ttf -o C:\Users\Danko\Documents\ArduinoWaveSpeaker\examples\winamp\assets\ui_font_small.c --format lvgl -r 0x20-0x7f --no-compress --no-prefilter
 ******************************************************************************/

#include "ui.h"

#ifndef UI_FONT_SMALL
#define UI_FONT_SMALL 1
#endif

#if UI_FONT_SMALL

/*-----------------
 *    BITMAPS
 *----------------*/

/*Store the image of the glyphs*/
static LV_ATTRIBUTE_LARGE_CONST const uint8_t glyph_bitmap[] = {
    /* U+0020 " " */
    0x0,

    /* U+0021 "!" */
    0xff, 0xff, 0xf,

    /* U+0022 "\"" */
    0x6d, 0xb4, 0xd2, 0x48,

    /* U+0023 "#" */
    0x31, 0xc, 0x43, 0x31, 0xff, 0x7f, 0xc8, 0xc6,
    0x23, 0xfe, 0xff, 0x99, 0x86, 0x61, 0x18,

    /* U+0024 "$" */
    0x0, 0x18, 0x3c, 0x7f, 0xfb, 0xd8, 0xf8, 0x7c,
    0x3e, 0x1f, 0x1b, 0xdf, 0xfe, 0x7c, 0x18, 0x18,

    /* U+0025 "%" */
    0x70, 0x4f, 0x8c, 0xd8, 0xcd, 0x98, 0xdb, 0xf,
    0xbe, 0x77, 0xf0, 0x7b, 0xd, 0xb1, 0x9b, 0x19,
    0xf1, 0xe,

    /* U+0026 "&" */
    0xf, 0x7, 0xf0, 0xc6, 0x18, 0x3, 0x0, 0x70,
    0x1b, 0x36, 0x34, 0xc3, 0x9c, 0x71, 0xff, 0x1e,
    0x20,

    /* U+0027 "'" */
    0x6d, 0x24,

    /* U+0028 "(" */
    0x19, 0xdc, 0xce, 0x63, 0x18, 0xc6, 0x30, 0xc7,
    0x1c, 0x60,

    /* U+0029 ")" */
    0xc7, 0x1c, 0x63, 0x8c, 0x63, 0x18, 0xce, 0x67,
    0x73, 0x0,

    /* U+002A "*" */
    0x27, 0xc9, 0xf2, 0x0,

    /* U+002B "+" */
    0x0, 0x18, 0x18, 0x18, 0xff, 0xff, 0x18, 0x18,
    0x18,

    /* U+002C "," */
    0xfd, 0xa0,

    /* U+002D "-" */
    0xff, 0xc0,

    /* U+002E "." */
    0xf0,

    /* U+002F "/" */
    0x0, 0x0, 0xc0, 0xc0, 0x60, 0x60, 0x30, 0x30,
    0x18, 0x8, 0xc, 0x4, 0x6, 0x2, 0x3, 0x1,
    0x80, 0x80,

    /* U+0030 "0" */
    0x3e, 0x3f, 0x98, 0xd8, 0x3c, 0x1e, 0xf, 0x7,
    0x83, 0xc1, 0xb1, 0x9f, 0xc7, 0xc0,

    /* U+0031 "1" */
    0x37, 0xfb, 0x33, 0x33, 0x33, 0x33,

    /* U+0032 "2" */
    0x39, 0xfb, 0x3c, 0x30, 0x61, 0xc3, 0xc, 0x30,
    0xc3, 0xff, 0xf0,

    /* U+0033 "3" */
    0xff, 0xfc, 0x71, 0xc3, 0xcf, 0x83, 0x83, 0x7,
    0x9f, 0xf3, 0xc0,

    /* U+0034 "4" */
    0x6, 0x7, 0x3, 0x83, 0xc3, 0x63, 0xb1, 0x99,
    0xff, 0xff, 0x83, 0x1, 0x80, 0xc0,

    /* U+0035 "5" */
    0x7f, 0x7f, 0x60, 0x60, 0x7c, 0x7e, 0x47, 0x3,
    0x3, 0x47, 0x7e, 0x7c,

    /* U+0036 "6" */
    0xe, 0x3c, 0x30, 0x60, 0x5c, 0xfe, 0xe7, 0xc3,
    0xc3, 0xe7, 0x7e, 0x3c,

    /* U+0037 "7" */
    0xff, 0xff, 0x6, 0x6, 0xe, 0xc, 0x1c, 0x18,
    0x38, 0x30, 0x30, 0x20,

    /* U+0038 "8" */
    0x38, 0x7c, 0xc6, 0xc6, 0xc6, 0x7c, 0x7e, 0xe7,
    0xc3, 0xe7, 0x7e, 0x3c,

    /* U+0039 "9" */
    0x3c, 0x7e, 0xe7, 0xc3, 0xc3, 0xe7, 0x7f, 0x3a,
    0x6, 0xc, 0x3c, 0x70,

    /* U+003A ":" */
    0xf0, 0x3, 0xc0,

    /* U+003B ";" */
    0x66, 0x0, 0x0, 0x6, 0xe2, 0x60,

    /* U+003C "<" */
    0x6, 0x3d, 0xe7, 0xe, 0x7, 0x7, 0x83,

    /* U+003D "=" */
    0xff, 0xff, 0x0, 0xff, 0xff,

    /* U+003E ">" */
    0xc1, 0xe0, 0xe0, 0x70, 0xe7, 0xbc, 0x60,

    /* U+003F "?" */
    0x79, 0xfb, 0x38, 0x30, 0x61, 0xcf, 0x18, 0x30,
    0x0, 0xc1, 0x80,

    /* U+0040 "@" */
    0x3, 0xf0, 0x1f, 0xf0, 0xf0, 0x71, 0xbb, 0x76,
    0xfe, 0x6d, 0x98, 0xf6, 0x31, 0xec, 0x67, 0xd9,
    0xcd, 0xbf, 0xf3, 0x39, 0xc3, 0x0, 0x7, 0x6,
    0x7, 0xf8, 0x3, 0xe0, 0x0,

    /* U+0041 "A" */
    0xc, 0x3, 0x1, 0xe0, 0x78, 0x1f, 0xc, 0xc3,
    0x31, 0xfe, 0x7f, 0x98, 0x3c, 0xf, 0x3,

    /* U+0042 "B" */
    0xfe, 0x7f, 0xb0, 0xd8, 0x6c, 0x37, 0xf3, 0xfd,
    0x83, 0xc1, 0xe0, 0xff, 0xdf, 0xc0,

    /* U+0043 "C" */
    0x1f, 0x1f, 0xdc, 0x1c, 0xc, 0x6, 0x3, 0x1,
    0x80, 0xe0, 0x38, 0xf, 0xe3, 0xe0,

    /* U+0044 "D" */
    0xfe, 0x3f, 0xcc, 0x1b, 0x7, 0xc0, 0xf0, 0x3c,
    0xf, 0x3, 0xc1, 0xf0, 0x6f, 0xf3, 0xf8,

    /* U+0045 "E" */
    0xff, 0xff, 0x6, 0xc, 0x1f, 0xbf, 0x60, 0xc1,
    0x83, 0xff, 0xf0,

    /* U+0046 "F" */
    0xff, 0xff, 0x6, 0xc, 0x1f, 0xbf, 0x60, 0xc1,
    0x83, 0x6, 0x0,

    /* U+0047 "G" */
    0xf, 0xf, 0xe7, 0x9, 0x80, 0xc0, 0x30, 0xc,
    0x3f, 0xf, 0x60, 0xdc, 0x33, 0xfc, 0x3e,

    /* U+0048 "H" */
    0xc1, 0xe0, 0xf0, 0x78, 0x3c, 0x1f, 0xff, 0xff,
    0x83, 0xc1, 0xe0, 0xf0, 0x78, 0x30,

    /* U+0049 "I" */
    0xff, 0xff, 0xff,

    /* U+004A "J" */
    0x6, 0xc, 0x18, 0x30, 0x60, 0xc1, 0x83, 0x7,
    0x9f, 0xf3, 0xc0,

    /* U+004B "K" */
    0xc1, 0xe1, 0xf1, 0xd9, 0xcd, 0xc7, 0xc3, 0xf1,
    0xdc, 0xc6, 0x63, 0xb0, 0xf8, 0x30,

    /* U+004C "L" */
    0xc1, 0x83, 0x6, 0xc, 0x18, 0x30, 0x60, 0xc1,
    0x83, 0xff, 0xf0,

    /* U+004D "M" */
    0xc0, 0x7c, 0xf, 0x83, 0xf8, 0xff, 0x9f, 0xb6,
    0xf3, 0x9e, 0x73, 0xc4, 0x78, 0xf, 0x1, 0xe0,
    0x30,

    /* U+004E "N" */
    0xc1, 0xe0, 0xf8, 0x7e, 0x3f, 0x1e, 0xcf, 0x37,
    0x8b, 0xc7, 0xe1, 0xf0, 0x78, 0x30,

    /* U+004F "O" */
    0x1f, 0x7, 0xf1, 0xc7, 0x70, 0x7c, 0x7, 0x80,
    0xf0, 0x1e, 0x3, 0xe0, 0xee, 0x38, 0xfe, 0xf,
    0x80,

    /* U+0050 "P" */
    0xfc, 0xfe, 0xc3, 0xc3, 0xc3, 0xc7, 0xfe, 0xfc,
    0xc0, 0xc0, 0xc0, 0xc0,

    /* U+0051 "Q" */
    0x1f, 0x3, 0xf8, 0x71, 0xce, 0xe, 0xc0, 0x6c,
    0x6, 0xc0, 0x6c, 0x6, 0xe0, 0xe7, 0x1c, 0x3f,
    0x81, 0xf0, 0x3e, 0x33, 0xff, 0x3, 0xe0,

    /* U+0052 "R" */
    0xfe, 0x3f, 0xcc, 0x1b, 0x6, 0xc1, 0xb0, 0xef,
    0xf3, 0xfc, 0xc1, 0xb0, 0x6c, 0x1b, 0x3,

    /* U+0053 "S" */
    0x3c, 0x7f, 0xe3, 0xc0, 0xe0, 0x7c, 0x3e, 0x7,
    0x3, 0xc7, 0xfe, 0x7c,

    /* U+0054 "T" */
    0x7f, 0x9f, 0xe0, 0xc0, 0x30, 0xc, 0x3, 0x0,
    0xc0, 0x30, 0xc, 0x3, 0x0, 0xc0, 0x30,

    /* U+0055 "U" */
    0xc1, 0xe0, 0xf0, 0x78, 0x3c, 0x1e, 0xf, 0x7,
    0x83, 0xc1, 0xf1, 0xdf, 0xc7, 0xc0,

    /* U+0056 "V" */
    0xc0, 0xf0, 0x36, 0x19, 0x86, 0x61, 0x8c, 0xc3,
    0x30, 0x68, 0x1e, 0x7, 0x80, 0xc0, 0x30,

    /* U+0057 "W" */
    0xc0, 0x7, 0x80, 0xf, 0x80, 0x3b, 0x8, 0x66,
    0x38, 0xce, 0x73, 0x8d, 0xb6, 0x1b, 0x6c, 0x34,
    0x58, 0x38, 0xe0, 0x71, 0xc0, 0xc1, 0x80,

    /* U+0058 "X" */
    0xc1, 0xf0, 0xd8, 0xc6, 0xc3, 0xe0, 0xe0, 0x70,
    0x7c, 0x36, 0x31, 0xb0, 0xf8, 0x30,

    /* U+0059 "Y" */
    0xc1, 0xf0, 0xd8, 0xc6, 0x63, 0xe0, 0xf0, 0x30,
    0x18, 0xc, 0x6, 0x3, 0x1, 0x80,

    /* U+005A "Z" */
    0xff, 0xff, 0xc0, 0xc0, 0xc0, 0xe0, 0xe0, 0x60,
    0x60, 0x70, 0x30, 0x3f, 0xff, 0xf0,

    /* U+005B "[" */
    0xff, 0xf1, 0x8c, 0x63, 0x18, 0xc6, 0x31, 0x8c,
    0x7f, 0xe0,

    /* U+005C "\\" */
    0x0, 0x60, 0x18, 0xc, 0x3, 0x1, 0x80, 0x60,
    0x30, 0xc, 0x6, 0x1, 0x0, 0xc0, 0x20, 0x18,
    0x4, 0x3,

    /* U+005D "]" */
    0xff, 0xc6, 0x31, 0x8c, 0x63, 0x18, 0xc6, 0x31,
    0xff, 0xe0,

    /* U+005E "^" */
    0x0, 0x3c, 0x3c, 0x7e, 0x66, 0xc3, 0xc3,

    /* U+005F "_" */
    0xff, 0xff, 0xf0,

    /* U+0060 "`" */
    0x19, 0x80,

    /* U+0061 "a" */
    0x3b, 0x7f, 0xe7, 0xc3, 0xc3, 0xc3, 0xe7, 0x7f,
    0x3b,

    /* U+0062 "b" */
    0xc0, 0xc0, 0xc0, 0xdc, 0xfe, 0xe7, 0xc3, 0xc3,
    0xc3, 0xe7, 0xfe, 0xdc,

    /* U+0063 "c" */
    0x3c, 0xff, 0x8e, 0xc, 0x18, 0x38, 0xbf, 0x3c,

    /* U+0064 "d" */
    0x3, 0x3, 0x3, 0x3b, 0x7f, 0xe7, 0xc3, 0xc3,
    0xc3, 0xe7, 0x7f, 0x3b,

    /* U+0065 "e" */
    0x3c, 0x7e, 0xe3, 0xff, 0xff, 0xc0, 0xe2, 0x7e,
    0x3c,

    /* U+0066 "f" */
    0x1c, 0x78, 0xc3, 0xe7, 0xc6, 0xc, 0x18, 0x30,
    0x60, 0xc1, 0x80,

    /* U+0067 "g" */
    0x3d, 0xbf, 0xf8, 0xf8, 0x3c, 0x1e, 0xf, 0x8e,
    0xff, 0x3d, 0x91, 0xdf, 0xc7, 0xc0,

    /* U+0068 "h" */
    0xc1, 0x83, 0x6, 0xef, 0xfc, 0xf1, 0xe3, 0xc7,
    0x8f, 0x1e, 0x30,

    /* U+0069 "i" */
    0xf3, 0xff, 0xff,

    /* U+006A "j" */
    0x33, 0x3, 0x33, 0x33, 0x33, 0x33, 0x37, 0x60,

    /* U+006B "k" */
    0xc1, 0x83, 0x6, 0x3c, 0xfb, 0xbe, 0x7c, 0xfd,
    0x9b, 0x1e, 0x10,

    /* U+006C "l" */
    0xff, 0xff, 0xff,

    /* U+006D "m" */
    0xdc, 0xef, 0xff, 0xe6, 0x3c, 0x63, 0xc6, 0x3c,
    0x63, 0xc6, 0x3c, 0x63, 0xc6, 0x30,

    /* U+006E "n" */
    0xdd, 0xff, 0x9e, 0x3c, 0x78, 0xf1, 0xe3, 0xc6,

    /* U+006F "o" */
    0x3e, 0x3f, 0xb8, 0xf8, 0x3c, 0x1e, 0xf, 0x8e,
    0xfe, 0x3e, 0x0,

    /* U+0070 "p" */
    0xdc, 0xfe, 0xe7, 0xc3, 0xc3, 0xc3, 0xe7, 0xfe,
    0xdc, 0xc0, 0xc0, 0xc0,

    /* U+0071 "q" */
    0x3b, 0x7f, 0xe7, 0xc3, 0xc3, 0xc3, 0xe7, 0x7f,
    0x3b, 0x3, 0x3, 0x3,

    /* U+0072 "r" */
    0xdf, 0xfe, 0x30, 0xc3, 0xc, 0x30, 0xc0,

    /* U+0073 "s" */
    0x79, 0xfb, 0x16, 0x7, 0x80, 0xf1, 0xff, 0x3c,

    /* U+0074 "t" */
    0x0, 0xcf, 0xff, 0x30, 0xc3, 0xc, 0x30, 0xf1,
    0xc0,

    /* U+0075 "u" */
    0xc7, 0x8f, 0x1e, 0x3c, 0x78, 0xf1, 0xbe, 0x78,

    /* U+0076 "v" */
    0x41, 0x31, 0x98, 0xce, 0x63, 0x61, 0xb0, 0x70,
    0x38, 0x8, 0x0,

    /* U+0077 "w" */
    0x40, 0x36, 0x23, 0x66, 0x66, 0x76, 0x3f, 0x63,
    0xdc, 0x39, 0xc1, 0x9c, 0x18, 0x80,

    /* U+0078 "x" */
    0xc7, 0x8d, 0xb1, 0xc3, 0x87, 0x1b, 0x63, 0xc6,

    /* U+0079 "y" */
    0xc7, 0x8f, 0x1e, 0x3c, 0x78, 0xf1, 0xff, 0x76,
    0x1f, 0xf3, 0xc0,

    /* U+007A "z" */
    0xff, 0xfc, 0x30, 0xc3, 0x86, 0x18, 0x7f, 0xfe,

    /* U+007B "{" */
    0x4, 0x73, 0xc, 0x30, 0xc3, 0x38, 0xe0, 0xc3,
    0xc, 0x30, 0xe1, 0xc0,

    /* U+007C "|" */
    0xff, 0xff, 0xff, 0xfc,

    /* U+007D "}" */
    0xc3, 0xc3, 0xc, 0x30, 0xc3, 0x7, 0x1c, 0xc3,
    0xc, 0x31, 0xcc, 0x0,

    /* U+007E "~" */
    0xf3, 0xfe, 0x78
};


/*---------------------
 *  GLYPH DESCRIPTION
 *--------------------*/

static const lv_font_fmt_txt_glyph_dsc_t glyph_dsc[] = {
    {.bitmap_index = 0, .adv_w = 0, .box_w = 0, .box_h = 0, .ofs_x = 0, .ofs_y = 0} /* id = 0 reserved */,
    {.bitmap_index = 0, .adv_w = 72, .box_w = 1, .box_h = 1, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 1, .adv_w = 68, .box_w = 2, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 4, .adv_w = 110, .box_w = 6, .box_h = 5, .ofs_x = 0, .ofs_y = 7},
    {.bitmap_index = 8, .adv_w = 177, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 23, .adv_w = 153, .box_w = 8, .box_h = 16, .ofs_x = 1, .ofs_y = -2},
    {.bitmap_index = 39, .adv_w = 209, .box_w = 12, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 57, .adv_w = 182, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 74, .adv_w = 54, .box_w = 3, .box_h = 5, .ofs_x = 0, .ofs_y = 7},
    {.bitmap_index = 76, .adv_w = 91, .box_w = 5, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 86, .adv_w = 91, .box_w = 5, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 96, .adv_w = 93, .box_w = 5, .box_h = 5, .ofs_x = 0, .ofs_y = 7},
    {.bitmap_index = 100, .adv_w = 148, .box_w = 8, .box_h = 9, .ofs_x = 1, .ofs_y = 2},
    {.bitmap_index = 109, .adv_w = 70, .box_w = 3, .box_h = 5, .ofs_x = 0, .ofs_y = -3},
    {.bitmap_index = 111, .adv_w = 101, .box_w = 5, .box_h = 2, .ofs_x = 1, .ofs_y = 4},
    {.bitmap_index = 113, .adv_w = 64, .box_w = 2, .box_h = 2, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 114, .adv_w = 145, .box_w = 9, .box_h = 16, .ofs_x = 0, .ofs_y = -2},
    {.bitmap_index = 132, .adv_w = 157, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 146, .adv_w = 100, .box_w = 4, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 152, .adv_w = 146, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 163, .adv_w = 137, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 174, .adv_w = 151, .box_w = 9, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 188, .adv_w = 147, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 200, .adv_w = 142, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 212, .adv_w = 141, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 224, .adv_w = 140, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 236, .adv_w = 145, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 248, .adv_w = 70, .box_w = 2, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 251, .adv_w = 75, .box_w = 4, .box_h = 12, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 257, .adv_w = 134, .box_w = 7, .box_h = 8, .ofs_x = 1, .ofs_y = 1},
    {.bitmap_index = 264, .adv_w = 158, .box_w = 8, .box_h = 5, .ofs_x = 1, .ofs_y = 3},
    {.bitmap_index = 269, .adv_w = 134, .box_w = 7, .box_h = 8, .ofs_x = 1, .ofs_y = 1},
    {.bitmap_index = 276, .adv_w = 135, .box_w = 7, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 287, .adv_w = 247, .box_w = 15, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 316, .adv_w = 164, .box_w = 10, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 331, .adv_w = 168, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 345, .adv_w = 161, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 359, .adv_w = 183, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 374, .adv_w = 146, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 385, .adv_w = 144, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 396, .adv_w = 178, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 411, .adv_w = 184, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 425, .adv_w = 70, .box_w = 2, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 428, .adv_w = 141, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 439, .adv_w = 168, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 453, .adv_w = 144, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 464, .adv_w = 210, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 481, .adv_w = 188, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 495, .adv_w = 194, .box_w = 11, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 512, .adv_w = 154, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 524, .adv_w = 193, .box_w = 12, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 547, .adv_w = 176, .box_w = 10, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 562, .adv_w = 153, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 574, .adv_w = 160, .box_w = 10, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 589, .adv_w = 180, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 603, .adv_w = 174, .box_w = 10, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 618, .adv_w = 241, .box_w = 15, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 641, .adv_w = 168, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 655, .adv_w = 153, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 669, .adv_w = 166, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 683, .adv_w = 104, .box_w = 5, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 693, .adv_w = 145, .box_w = 9, .box_h = 16, .ofs_x = 0, .ofs_y = -2},
    {.bitmap_index = 711, .adv_w = 104, .box_w = 5, .box_h = 15, .ofs_x = 0, .ofs_y = -3},
    {.bitmap_index = 721, .adv_w = 158, .box_w = 8, .box_h = 7, .ofs_x = 1, .ofs_y = 5},
    {.bitmap_index = 728, .adv_w = 180, .box_w = 10, .box_h = 2, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 731, .adv_w = 66, .box_w = 3, .box_h = 3, .ofs_x = 0, .ofs_y = 9},
    {.bitmap_index = 733, .adv_w = 161, .box_w = 8, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 742, .adv_w = 161, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 754, .adv_w = 133, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 762, .adv_w = 161, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 774, .adv_w = 151, .box_w = 8, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 783, .adv_w = 112, .box_w = 7, .box_h = 12, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 794, .adv_w = 163, .box_w = 9, .box_h = 12, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 808, .adv_w = 150, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 819, .adv_w = 60, .box_w = 2, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 822, .adv_w = 70, .box_w = 4, .box_h = 15, .ofs_x = -1, .ofs_y = -3},
    {.bitmap_index = 830, .adv_w = 146, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 841, .adv_w = 69, .box_w = 2, .box_h = 12, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 844, .adv_w = 236, .box_w = 12, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 858, .adv_w = 153, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 866, .adv_w = 160, .box_w = 9, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 877, .adv_w = 161, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 889, .adv_w = 161, .box_w = 8, .box_h = 12, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 901, .adv_w = 111, .box_w = 6, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 908, .adv_w = 123, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 916, .adv_w = 105, .box_w = 6, .box_h = 11, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 925, .adv_w = 150, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 933, .adv_w = 144, .box_w = 9, .box_h = 9, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 944, .adv_w = 197, .box_w = 12, .box_h = 9, .ofs_x = 0, .ofs_y = 0},
    {.bitmap_index = 958, .adv_w = 125, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 966, .adv_w = 150, .box_w = 7, .box_h = 12, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 977, .adv_w = 124, .box_w = 7, .box_h = 9, .ofs_x = 1, .ofs_y = 0},
    {.bitmap_index = 985, .adv_w = 103, .box_w = 6, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 997, .adv_w = 63, .box_w = 2, .box_h = 15, .ofs_x = 1, .ofs_y = -2},
    {.bitmap_index = 1001, .adv_w = 103, .box_w = 6, .box_h = 15, .ofs_x = 1, .ofs_y = -3},
    {.bitmap_index = 1013, .adv_w = 138, .box_w = 7, .box_h = 3, .ofs_x = 1, .ofs_y = 4}
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
    -4, -10, -18, 2, -10, -13, -8, -24,
    -10, -1, -4, -5, -3, -1, -8, -7,
    -4, 2, 2, 2, 2, 2, -3, 0,
    -8, -8, -5, -10, -5, -8, -18, 10,
    -10, -8, -5, -5, -5, -5, -5, -10,
    -8, -8, -1, -1, -1, -1, -13, -3,
    -24, -6, -11, 5, -1, -3, -7, -2,
    -6, -4, -2, -2, -3, -6, -1, 0,
    0, 0, -1, -1, -1, -1, 0, 0,
    -1, -10, -1, -4, -5, -3, -1, -8,
    -7, -4, 2, 2, 2, 2, 2, -3,
    0, -3, -1, -1, -1, -3, -1, -1,
    -3, -4, -3, -8, -2, -2, -31, -2,
    -2, -1, 4, -1, -5, -4, -4, -4,
    -3, -2, -2, -4, -2, -4, -2, -3,
    -4, -1, -4, -1, -6, -4, -3, -6,
    4, -4, -8, -8, -1, -8, -8, -3,
    -4, -1, -1, 5, -5, -5, -5, -2,
    -2, -5, -2, -5, -2, -1, -1, -3,
    -2, -4, -5, -3, -3, -3, -3, -26,
    -5, -13, -8, -15, -1, -6, -1, -6,
    5, -10, -1, -4, -5, -3, -1, -8,
    -7, -4, 2, 2, 2, 2, 2, -3,
    0, -26, -26, -10, -19, 2, -4, -4,
    -1, -3, -3, -3, 2, -3, -3, -3,
    4, -1, 3, 4, 3, -10, -1, -4,
    -5, -3, -1, -8, -7, -4, 2, 2,
    2, 2, 2, -3, 0, -3, -3, -3,
    -3, -4, -1, -4, 0, -5, 1, -1,
    -1, -1, -1, -1, -3, -4, -4, -26,
    -13, -5, -5, -17, -5, -5, 8, 3,
    3, 3, -26, -31, -31, -31, -12, -15,
    -15, -31, -5, -31, -15, -26, -31, -3,
    -31, -4, -3, -31, -3, -3, -3, -3,
    -3, -1, -9, -3, -3, -14, -3, -3,
    -3, 3, -3, -6, -6, -6, -5, -3,
    -3, -6, -3, -6, -3, -4, -3, -1,
    -6, -1, -1, -8, -1, -1, -3, 3,
    -2, -4, -4, -4, -5, -1, -1, -4,
    -1, -4, -1, -3, -7, -7, -7, -7,
    -4, -3, -4, -4, -4, -1, -4, -4,
    -3, -7, -4, -6, -11, -7, -7, -18,
    -7, -7, -6, 3, -3, -8, -10, -10,
    -10, -10, -6, -6, -10, -5, -10, -6,
    -9, -5, -3, -3, -5, -3, -3, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -24, 5, -5, -5, -5, -5,
    -17, -3, -7, -3, -14, 3, -3, -3,
    -2, -12, -6, -4, -4, -10, -3, -1,
    -3, -8, -4, -3, -1, -9, 4, -12,
    -5, -3, -3, -9, 1, -1, -1, -1,
    -5, 15, 14, 13, 13, 13, 13, -8,
    -8, -8, -8, -8, 1, 3, 1, 1,
    -1, -4, -3, -3, -3, -3, -1, -4,
    -1, -5, -5, -5, 3, -5, -5, -3,
    -2, -8, -4, -6, -1, -1, -8, -8,
    -3, 1, -3, -3, -3, -3, -5, -1,
    -1, -6, -6, -6, -1, -1, -1, -1,
    -6, -6, -1, -1, -5, -5, -5, -5,
    -6, -8, -5, -8, -3, -3, -3, -3,
    -4, -3, -3, -1, -1, -6, -4, -4,
    -8, -4, -6, -1, -1, -8, -4, -6,
    -1, -1, -12, -6, -4, -4, -10, -3,
    -1, -3, -12, -6, -4, -4, -10, -3,
    -1, -3, -5, -3, -4, -31, -8, -3,
    -4, -3, -6, -6, -6, -4, -3, -6,
    -6, 13, 13, -1, -1, -1, -1, -12,
    -1, -1, -5, 2, -1, -1, -1, -1,
    -6, -1, -1, -1, 5, 10, -8, -3,
    -3, -4, -3, -6, -3, -7, -3, -5,
    -1, -1, -1, -1, -1, -1, -1, -1,
    13, 13, -1, -3, -4, -3, -1, 1,
    -1, 13, 10, -3, -3, -3, -3, -4,
    -1, -5, -1, 13, -1, -6, -3, -5,
    -3, -3, -1, -1, -1, -4, -1, -1,
    -3, -3, -3, -3, -3, -3, -3, -3,
    -10
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
const lv_font_t ui_font_small = {
#else
lv_font_t ui_font_small = {
#endif
    .get_glyph_dsc = lv_font_get_glyph_dsc_fmt_txt,    /*Function pointer to get glyph's data*/
    .get_glyph_bitmap = lv_font_get_bitmap_fmt_txt,    /*Function pointer to get glyph's bitmap*/
    .line_height = 17,          /*The maximum line height required by the font*/
    .base_line = 3,             /*Baseline measured from the bottom of the line*/
#if !(LVGL_VERSION_MAJOR == 6 && LVGL_VERSION_MINOR == 0)
    .subpx = LV_FONT_SUBPX_NONE,
#endif
#if LV_VERSION_CHECK(7, 4, 0) || LVGL_VERSION_MAJOR >= 8
    .underline_position = -2,
    .underline_thickness = 1,
#endif
    .dsc = &font_dsc           /*The custom font data. Will be accessed by `get_glyph_bitmap/dsc` */
};



#endif /*#if UI_FONT_SMALL*/

