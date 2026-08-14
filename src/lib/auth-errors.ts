// Supabase คืน error เป็นภาษาอังกฤษและอ่านยากสำหรับผู้ใช้ทั่วไป
// แปลงเป็นข้อความไทยที่บอกว่า "ต้องทำอะไรต่อ" ไม่ใช่แค่ "อะไรพัง"

export function authErrorMessage(raw: string): string {
  const msg = raw.toLowerCase();

  if (msg.includes("invalid login credentials"))
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (msg.includes("email not confirmed"))
    return "อีเมลนี้ยังไม่ได้รับการยืนยัน กรุณาตรวจสอบกล่องจดหมาย (รวมถึงอีเมลขยะ) และกดลิงก์ยืนยันก่อนเข้าสู่ระบบ";
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  )
    return "อีเมลนี้ถูกใช้สมัครสมาชิกไว้แล้ว กรุณาเข้าสู่ระบบแทน";
  if (msg.includes("password should be at least"))
    return "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร";
  if (msg.includes("unable to validate email") || msg.includes("invalid email"))
    return "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (msg.includes("email rate limit") || msg.includes("too many requests"))
    return "มีการดำเนินการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout")
  )
    return "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง";

  // กรณีที่ยังไม่ได้แปล — แสดงข้อความเดิมไว้ ดีกว่าปิดบังปัญหา
  return raw;
}
