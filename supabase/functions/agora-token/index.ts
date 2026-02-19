import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

// RtcTokenBuilder를 위한 크립토 유틸리티
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  let result = ""
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i].toString(16)
    result += hex.length === 1 ? "0" + hex : hex
  }
  return result
}

async function generateToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number | string,
  expirationTimeInSeconds: number = 3600
): Promise<string> {
  const crypto = globalThis.crypto

  // 타임스탬프 및 토큰 구조 생성
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const expireTimestamp = nowInSeconds + expirationTimeInSeconds

  // 메시지 구성: appId + channelName + uid + expireTime
  const msgStr = `${appId}${channelName}${uid}${expireTimestamp}`
  const msgBytes = new TextEncoder().encode(msgStr)

  // HMAC-SHA256 생성
  const keyBytes = new TextEncoder().encode(appCertificate)
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signatureBytes = await crypto.subtle.sign("HMAC", key, msgBytes)
  const signatureHex = bytesToHex(new Uint8Array(signatureBytes))

  // 토큰 조합: appId + channelName + uid + expireTime + signature
  const token = `${appId}${channelName}${uid}${expireTimestamp}${signatureHex}`

  return token
}

serve(async (req) => {
  // CORS 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  try {
    const { channelName, uid } = await req.json()

    // 환경 변수 검증
    const appId = Deno.env.get("AGORA_APP_ID")
    const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE")

    if (!appId || !appCertificate) {
      return new Response(
        JSON.stringify({
          error: "Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE environment variables",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    if (!channelName || uid === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing channelName or uid" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    // 토큰 생성 (1시간 만료)
    const token = await generateToken(
      appId,
      appCertificate,
      channelName,
      String(uid),
      3600
    )

    return new Response(
      JSON.stringify({
        token,
        expireTime: 3600,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error generating Agora token:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
