export type MessageModerationResult = {
  allowed: boolean
  reason?: string
}

export function checkMessageForContactInfo(
  message: string
): MessageModerationResult {
  const text = message.trim()
  const lower = text.toLowerCase()

  // Email address
  const emailPattern =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i

  if (emailPattern.test(text)) {
    return {
      allowed: false,
      reason: "email_address",
    }
  }

  // Website / external link
  const urlPattern =
    /\b(?:https?:\/\/|www\.)\S+/i

  if (urlPattern.test(text)) {
    return {
      allowed: false,
      reason: "external_link",
    }
  }

  // Common messaging apps / attempts to move off GBTS
  const externalMessagingTerms = [
    "whatsapp",
    "telegram",
    "viber",
    "messenger",
    "facebook messenger",
    "fb messenger",
    "contact me",
    "call me",
    "text me",
    "message me on",
  ]

  if (
    externalMessagingTerms.some((term) =>
      lower.includes(term)
    )
  ) {
    return {
      allowed: false,
      reason: "external_contact_request",
    }
  }

  // Phone-number-like strings
  // Removes spaces, dashes, brackets etc. before checking.
  const possiblePhoneMatches =
    text.match(/(?:\+?\d[\d\s().-]{7,}\d)/g)

  if (possiblePhoneMatches) {
    for (const match of possiblePhoneMatches) {
      const digits = match.replace(/\D/g, "")

      // Most PH/SG phone numbers will fall within this range.
      // This avoids blocking simple quantities such as "30 notebooks".
      if (digits.length >= 8 && digits.length <= 15) {
        return {
          allowed: false,
          reason: "phone_number",
        }
      }
    }
  }

  return {
    allowed: true,
  }
}
