const INBOX_KEY = "avaya-crm-website-inbox";

export function captureWebsiteEnquiry(formData, source) {
  const enquiry = {
    id: `WEB-${Date.now()}`,
    source,
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    city: formData.city,
    address: formData.address,
    message: formData.message,
    receivedAt: new Date().toISOString(),
    status: "New",
  };

  try {
    const current = JSON.parse(localStorage.getItem(INBOX_KEY)) || [];
    localStorage.setItem(INBOX_KEY, JSON.stringify([enquiry, ...current]));
  } catch {
    // The public form remains usable if local storage is unavailable.
  }

  return enquiry;
}

export const WEBSITE_INBOX_KEY = INBOX_KEY;
