# QR Signature Verification — Setup

`QRSignatureVerifier` checks that an Aadhaar QR code was genuinely
digitally signed by UIDAI (not just internally consistent with the
OCR text / what the user typed).

## One manual step required

I could not download this for you — network access here is
restricted, and this file is a trust anchor that must come directly
from UIDAI, not from me.

1. Get UIDAI's **offline verification public certificate** from
   UIDAI's official resources page (search "UIDAI Aadhaar QR Code
   offline verification certificate" — it's a `.cer`/`.pem` file).
2. Place it in your actual Spring Boot project at:
   ```
   src/main/resources/certs/uidai_offline_publickey.cer
   ```
   (Path is configurable via the `aadhaar.qr.certificate.path`
   property in `application.properties` if you want a different
   location.)

## Behavior before/after you add the certificate

| Situation | Behavior |
|---|---|
| Certificate **not installed** (default, right now) | Signature check is skipped silently. Everything works exactly as before — no new rejections. |
| Certificate installed, `aadhaar.qr.signature.strict` **not set** (default `false`) | Signature IS verified and logged/stored (`AadhaarQRData.signatureStatus`), but a failed/unverifiable signature does **not** by itself reject the request — only a signature that's checked and comes back `INVALID` does. |
| Certificate installed, `aadhaar.qr.signature.strict=true` (add to `application.properties`) | Strictest mode: ANY QR that isn't cryptographically verified as UIDAI-signed (missing cert, unreadable payload, or invalid signature) gets rejected. |

## Recommended rollout

1. Install the certificate.
2. Run it in non-strict mode for a while and just log/observe
   `signatureStatus` on real uploads to confirm it's reliably
   returning `VALID` for genuine cards (Aadhaar QR formats have
   changed over the years — v1 old paper Aadhaar vs v2 modern Secure
   QR — so it's worth confirming your users' real cards decode
   cleanly before enforcing).
3. Once confident, set `aadhaar.qr.signature.strict=true`.
