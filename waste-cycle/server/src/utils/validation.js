// server/src/utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (fields, data) => {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  }
  return missing;
};

export const validateProduct = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!data.type || !['waste', 'fertilizer', 'plant_residue'].includes(data.type)) {
    errors.push('Valid product type is required (waste, fertilizer, plant_residue)');
  }
  
  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (!data.unit || !['kg', 'ton', 'bag'].includes(data.unit)) {
    errors.push('Valid unit is required (kg, ton, bag)');
  }
  
  if (!data.location || data.location.trim() === '') {
    errors.push('Location is required');
  }
  
  return errors;
};

export const validateFarm = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('Farm name is required');
  }
  
  if (!data.type || !['livestock', 'crop'].includes(data.type)) {
    errors.push('Farm type must be livestock or crop');
  }
  
  if (!data.location || data.location.trim() === '') {
    errors.push('Location is required');
  }
  
  if (data.area && data.area <= 0) {
    errors.push('Area must be greater than 0');
  }
  
  return errors;
};

export const validateBooking = (data) => {
  const errors = [];
  
  if (!data.productId) {
    errors.push('Product ID is required');
  }
  
  if (!data.quantity || data.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (!data.deliveryDate) {
    errors.push('Delivery date is required');
  }
  
  // ตรวจสอบว่าวันที่ส่งต้องไม่เป็นอดีต
  const deliveryDate = new Date(data.deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (deliveryDate < today) {
    errors.push('Delivery date cannot be in the past');
  }
  
  return errors;
};