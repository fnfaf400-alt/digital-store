import nodemailer from "nodemailer";

interface SendOrderEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  productTitle: string;
  downloadUrl: string;
  totalFormatted: string;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  productTitle,
  downloadUrl,
  totalFormatted,
}: SendOrderEmailParams) {
  // إعداد وسيط الإرسال (في بيئة التطوير نستخدم حساباً تجريبياً أو نطبع التفاصيل)
  const isProd = process.env.NODE_ENV === "production" && process.env.SMTP_HOST;

  if (!isProd) {
    console.log("\n================ 📧 إشعار بريد إلكتروني جديد ================");
    console.log(`إلى: ${to}`);
    console.log(`الموضوع: تم تأكيد طلبك بنجاح! رقم الطلب: ${orderId}`);
    console.log(`مرحباً ${customerName}، شكراً لشرائك: ${productTitle}`);
    console.log(`المبلغ المدفوع: ${totalFormatted}`);
    console.log(`رابط تنزيل الملف الخاص بك: ${downloadUrl}`);
    console.log("============================================================\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ديجيتال ستور" <no-reply@digital-store.local>',
    to,
    subject: `تم تأكيد طلبك بنجاح! (#${orderId})`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>شكراً لطلبك من متجرنا!</h2>
        <p>مرحباً <strong>${customerName}</strong>،</p>
        <p>تم استلام مدفوعاتك بنجاح لمنتج: <strong>${productTitle}</strong>.</p>
        <p>المبلغ الإجمالي: <strong>${totalFormatted}</strong></p>
        <div style="margin: 20px 0;">
          <a href="${downloadUrl}" style="background-color: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            تنزيل الملف الرقمي الآن
          </a>
        </div>
        <p style="color: #777; font-size: 13px;">رقم الطلب: ${orderId}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
