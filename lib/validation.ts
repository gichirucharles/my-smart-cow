export type ValidationError = {
  field: string
  message: string
}

export function validateCow(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.tagNumber) {
    errors.push({ field: "tagNumber", message: "Tag number is required" })
  }

  if (!data.name) {
    errors.push({ field: "name", message: "Name is required" })
  }

  return errors
}

export function validateMilkProduction(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.cowId) {
    errors.push({ field: "cowId", message: "Cow is required" })
  }

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.timeOfDay) {
    errors.push({ field: "timeOfDay", message: "Time of day is required" })
  }

  if (!data.amount) {
    errors.push({ field: "amount", message: "Amount is required" })
  } else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive number" })
  }

  return errors
}

export function validateVetVisit(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.cowId) {
    errors.push({ field: "cowId", message: "Cow is required" })
  }

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.reason) {
    errors.push({ field: "reason", message: "Reason is required" })
  }

  if (!data.cost) {
    errors.push({ field: "cost", message: "Cost is required" })
  } else if (isNaN(Number(data.cost)) || Number(data.cost) < 0) {
    errors.push({ field: "cost", message: "Cost must be a non-negative number" })
  }

  return errors
}

export function validateFeed(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.type && !data.customType) {
    errors.push({ field: "type", message: "Feed type is required" })
  }

  if (!data.quantity) {
    errors.push({ field: "quantity", message: "Quantity is required" })
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
    errors.push({ field: "quantity", message: "Quantity must be a positive number" })
  }

  if (!data.cost) {
    errors.push({ field: "cost", message: "Cost is required" })
  } else if (isNaN(Number(data.cost)) || Number(data.cost) < 0) {
    errors.push({ field: "cost", message: "Cost must be a non-negative number" })
  }

  if (data.bags !== undefined) {
    if (isNaN(Number(data.bags)) || Number(data.bags) < 0) {
      errors.push({ field: "bags", message: "Number of bags must be a non-negative number" })
    }
  }

  return errors
}

export function validateVendor(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.name) {
    errors.push({ field: "name", message: "Name is required" })
  }

  if (!data.phone) {
    errors.push({ field: "phone", message: "Phone number is required" })
  }

  return errors
}

export function validateMilkCollection(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.vendorId) {
    errors.push({ field: "vendorId", message: "Vendor is required" })
  }

  if (!data.date) {
    errors.push({ field: "date", message: "Date is required" })
  }

  if (!data.time) {
    errors.push({ field: "time", message: "Time is required" })
  }

  if (!data.quantity) {
    errors.push({ field: "quantity", message: "Quantity is required" })
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
    errors.push({ field: "quantity", message: "Quantity must be a positive number" })
  }

  if (!data.price) {
    errors.push({ field: "price", message: "Price is required" })
  } else if (isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.push({ field: "price", message: "Price must be a non-negative number" })
  }

  return errors
}
