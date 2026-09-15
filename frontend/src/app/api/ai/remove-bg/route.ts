import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let geminiAnalysis: any = null;

    if (apiKey) {
      try {
        // Call Gemini 2.5 Flash / 1.5 Flash Vision to analyze subject boundaries and background colors
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'image/png',
                        data: base64Data,
                      },
                    },
                    {
                      text: `Analyze this anime/character image for background removal. 
Identify the primary character subject and return strictly a raw JSON object (no markdown formatting, no text around it):
{
  "box_2d": [ymin, xmin, ymax, xmax],
  "bg_color_rgb": [r, g, b],
  "has_dark_halo": true/false,
  "confidence": 0.95
}
Notes:
- box_2d coordinates must be integers normalized between 0 and 1000.
- bg_color_rgb is the RGB array of the outer background (e.g. [255,255,255] or dark/grey).`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          try {
            geminiAnalysis = JSON.parse(cleanedText);
          } catch (e) {
            console.warn('Could not parse Gemini JSON response:', text);
          }
        } else {
          console.warn('Gemini API HTTP Error status:', response.status);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call warning, fallback to smart matting:', geminiErr);
      }
    }

    return NextResponse.json({
      success: true,
      geminiAnalysis,
      message: geminiAnalysis 
        ? 'Gemini AI subject segmentation completed' 
        : 'Smart AI background matting ready',
    });
  } catch (error: any) {
    console.error('AI Remove-BG Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
