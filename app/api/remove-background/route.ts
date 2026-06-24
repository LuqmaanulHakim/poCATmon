import { NextRequest, NextResponse } from "next/server";

// ==================================================
// CLEARBACKDROP (with quota tracking)
// ==================================================
// async function tryClearBackdrop(
//   imageBuffer: Buffer,
//   mimeType: string
// ): Promise<{
//   buffer: Buffer;
//   remaining: string | null;
//   limit: string | null;
//   reset: string | null;
// } | null> {
//   const formData = new FormData();

//   formData.append(
//     "image",
//     new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
//     "image.png"
//   );

//   const res = await fetch(
//     "https://clearbackdrop.com/api/v1/remove-background",
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   if (!res.ok) return null;

//   const buffer = Buffer.from(await res.arrayBuffer());

//   return {
//     buffer,
//     remaining: res.headers.get("X-RateLimit-Remaining"),
//     limit: res.headers.get("X-RateLimit-Limit"),
//     reset: res.headers.get("X-RateLimit-Reset"),
//   };
// }

// ==================================================
// PHOTOROOM
// ==================================================
async function tryPhotoRoom(
  imageBuffer: Buffer,
  mimeType: string
): Promise<Buffer | null> {
  const formData = new FormData();

  formData.append(
    "image_file",
    new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
    "image.png"
  );

  const res = await fetch(
    "https://sdk.photoroom.com/v1/segment",
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.PHOTOROOM_API_KEY!,
      },
      body: formData,
    }
  );

  if (!res.ok) return null;

  return Buffer.from(await res.arrayBuffer());
}

// ==================================================
// MAIN ROUTE
// ==================================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";

    // ==================================================
    // 2. PHOTOROOM
    // ==================================================
    try {
      const result = await tryPhotoRoom(imageBuffer, mimeType);

      if (result) {
        return new NextResponse(new Uint8Array(result), {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "X-Provider": "photoroom",
          },
        });
      }
    } catch (err) {
      console.warn("PhotoRoom error:", err);
    }

    return NextResponse.json(
      {
        error: "All providers exhausted",
      },
      { status: 503 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}