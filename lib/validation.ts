export function validatePropertyForm(formData: {
  id: string
  address: string
  price: string
  area: string
  status: string
  owner: string
  ownerPhone: string
  rooms?: string
  district?: string
}): { valid: boolean; error?: string } {
  if (!formData.id?.trim()) {
    return { valid: false, error: "ID об'єкта обов'язковий" }
  }

  if (!formData.address?.trim()) {
    return { valid: false, error: "Адреса обов'язкова" }
  }

  if (!formData.price?.trim() || Number(formData.price) <= 0) {
    return { valid: false, error: "Ціна має бути більше 0" }
  }

  if (!formData.area?.trim() || Number(formData.area) <= 0) {
    return { valid: false, error: "Площа має бути більше 0" }
  }

  // Validate rooms if provided (optional but must be valid if provided)
  if (formData.rooms?.trim() && Number(formData.rooms) <= 0) {
    return { valid: false, error: "Кількість кімнат має бути більше 0" }
  }

  // District can be empty or a valid string (optional field)
  if (formData.district?.trim() && formData.district.trim().length < 2) {
    return { valid: false, error: "Район має бути не менше 2 символів" }
  }

  return { valid: true }
}

export function validateShowingForm(formData: {
  objectId: string
  date: string
  time: string
}): { valid: boolean; error?: string } {
  if (!formData.objectId?.trim()) {
    return { valid: false, error: "Виберіть об'єкт" }
  }

  if (!formData.date?.trim()) {
    return { valid: false, error: "Виберіть дату" }
  }

  if (!formData.time?.trim()) {
    return { valid: false, error: "Виберіть час" }
  }

  return { valid: true }
}
