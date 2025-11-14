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
  // 🚨 [แก้ไข]
  const errors = [];
  if (!data.name || data.name.trim() === '') {
    errors.push('กรุณาระบุชื่อสินค้า');
  }
  if (!data.type || !['waste', 'fertilizer', 'plant_residue'].includes(data.type)) {
    errors.push('กรุณาระบุประเภทสินค้าที่ถูกต้อง (waste, fertilizer, plant_residue)');
  }
  if (!data.quantity || data.quantity <= 0) {
    errors.push('จำนวนต้องมากกว่า 0');
  }
  if (!data.unit || !['kg', 'ton', 'bag'].includes(data.unit)) {
    errors.push('กรุณาระบุหน่วยที่ถูกต้อง (kg, ton, bag)');
  }
  if (!data.location || data.location.trim() === '') {
    errors.push('กรุณาระบุตำแหน่งที่ตั้ง');
  }
  return errors;
};

export const validateFarm = (data) => {
  // 🚨 [แก้ไข]
  const errors = [];
  if (!data.name || data.name.trim() === '') {
    errors.push('กรุณาระบุชื่อฟาร์ม');
  }
  if (!data.type || !['livestock', 'crop'].includes(data.type)) {
    errors.push('ประเภทฟาร์มต้องเป็น livestock (ฟาร์มสัตว์) หรือ crop (ฟาร์มพืช)');
  }
  if (!data.location || data.location.trim() === '') {
    errors.push('กรุณาระบุตำแหน่งที่ตั้ง');
  }
  if (data.area && data.area <= 0) {
    errors.push('พื้นที่ต้องมากกว่า 0');
  }
  return errors;
};

export const validateBooking = (data) => {
  // 🚨 [แก้ไข]
  const errors = [];
  if (!data.productId) {
    errors.push('กรุณาระบุ ID สินค้า');
  }
  if (!data.quantity || data.quantity <= 0) {
    errors.push('จำนวนต้องมากกว่า 0');
  }
  if (!data.deliveryDate) {
    errors.push('กรุณาระบุวันที่จัดส่ง');
  }
  
  const deliveryDate = new Date(data.deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (deliveryDate < today) {
    errors.push('วันที่จัดส่งต้องไม่เป็นวันที่ผ่านมาแล้ว');
  }
  return errors;
};