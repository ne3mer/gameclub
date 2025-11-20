import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

const initializeEmailService = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️  Email service not configured. SMTP credentials missing.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587'),
      secure: parseInt(env.SMTP_PORT || '587') === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });

    console.log('✅ Email service initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error);
    return null;
  }
};

// Initialize on module load
if (!transporter) {
  transporter = initializeEmailService();
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!transporter) {
    console.warn('Email service not available. Skipping email send.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"GameClub" <${env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    });

    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, totalAmount: number, items: Array<{ title: string; quantity: number; price: number }>) => {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left;">${item.price.toLocaleString('fa-IR')} تومان</td>
      </tr>
    `).join('');

    return {
      subject: `تأیید سفارش ${orderNumber} - GameClub`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تأیید سفارش</title>
        </head>
        <body style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GameClub</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">سفارش شما با موفقیت ثبت شد</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #10b981; margin-top: 0;">سفارش شما ثبت شد!</h2>
            <p>سفارش شما با شماره <strong>${orderNumber}</strong> با موفقیت ثبت شد.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">جزئیات سفارش:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e5e7eb;">
                    <th style="padding: 8px; text-align: right;">محصول</th>
                    <th style="padding: 8px; text-align: center;">تعداد</th>
                    <th style="padding: 8px; text-align: left;">قیمت</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">جمع کل:</td>
                    <td style="padding: 8px; text-align: left; font-weight: bold; color: #10b981;">${totalAmount.toLocaleString('fa-IR')} تومان</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ توجه:</strong> پس از پرداخت موفق، اطلاعات اکانت به همین ایمیل و همچنین در پنل کاربری شما ارسال خواهد شد.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${env.CLIENT_URL}/orders" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">مشاهده سفارش</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
              این ایمیل به صورت خودکار ارسال شده است. لطفاً به آن پاسخ ندهید.<br>
              برای پشتیبانی با ما تماس بگیرید.
            </p>
          </div>
        </body>
        </html>
      `
    };
  },

  orderPaid: (orderNumber: string, credentials: string, message?: string) => {
    return {
      subject: `اطلاعات اکانت سفارش ${orderNumber} - GameClub`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>اطلاعات اکانت</title>
        </head>
        <body style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">GameClub</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">اطلاعات اکانت شما آماده است</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #10b981; margin-top: 0;">✅ سفارش شما آماده است!</h2>
            <p>سفارش شما با شماره <strong>${orderNumber}</strong> پرداخت و آماده تحویل است.</p>
            
            ${message ? `
              <div style="background: #eff6ff; border-right: 4px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; white-space: pre-line;">${message}</p>
              </div>
            ` : ''}
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <h3 style="margin-top: 0; color: #374151;">اطلاعات اکانت:</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; word-break: break-all; border: 1px solid #e5e7eb;">
                ${credentials}
              </div>
            </div>
            
            <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>🔒 امنیت:</strong> این اطلاعات را در جای امن نگهداری کنید و با کسی به اشتراک نگذارید.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${env.CLIENT_URL}/orders/${orderNumber}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">مشاهده سفارش</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  priceAlert: (gameTitle: string, currentPrice: number, targetPrice: number, gameUrl: string) => {
    return {
      subject: `🎉 قیمت ${gameTitle} کاهش یافت! - GameClub`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>هشدار قیمت</title>
        </head>
        <body style="font-family: Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 خبر خوب!</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0;">قیمت بازی کاهش یافت</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #f59e0b; margin-top: 0;">${gameTitle}</h2>
            <p>قیمت این بازی به قیمت مورد نظر شما رسید!</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: #6b7280;">قیمت قبلی:</span>
                <span style="text-decoration: line-through; color: #9ca3af;">${targetPrice.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #10b981; font-weight: bold;">قیمت فعلی:</span>
                <span style="color: #10b981; font-size: 24px; font-weight: bold;">${currentPrice.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${gameUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">مشاهده و خرید</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

