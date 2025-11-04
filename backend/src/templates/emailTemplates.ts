import { IOrder } from '../models/Order';
import { IContact } from '../models/Contact';

// Interface for order confirmation email data
export interface OrderConfirmationData {
  order: IOrder;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

// Base email styles matching website branding
const baseEmailStyles = `
  <style>
    body { 
      font-family: 'Inter', Arial, sans-serif; 
      line-height: 1.6; 
      color: #3A3A3A; 
      margin: 0; 
      padding: 0; 
      background-color: #FAF8F5;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #FAF8F5;
    }
    .email-wrapper {
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #9CAF88 0%, #B8C5A6 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content { 
      padding: 30px 20px; 
    }
    .order-details { 
      background-color: #F7F5F2; 
      padding: 25px; 
      border-radius: 8px; 
      margin: 25px 0; 
      border-left: 4px solid #9CAF88;
    }
    .order-details h2 {
      color: #8B6F47;
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .order-details h3 {
      color: #8B6F47;
      margin: 25px 0 15px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .order-info-item {
      background-color: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #E8E6E1;
    }
    .order-info-label {
      font-size: 12px;
      color: #6B6B6B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .order-info-value {
      font-size: 16px;
      font-weight: 600;
      color: #3A3A3A;
    }
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .items-table th { 
      background-color: #9CAF88; 
      color: white;
      padding: 15px 12px; 
      text-align: left; 
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td { 
      padding: 15px 12px; 
      border-bottom: 1px solid #E8E6E1; 
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .painting-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid #E8E6E1;
    }
    .painting-title {
      font-weight: 600;
      color: #3A3A3A;
      margin-bottom: 5px;
    }
    .painting-details {
      font-size: 12px;
      color: #6B6B6B;
    }
    .price {
      font-weight: 600;
      color: #8B6F47;
      font-size: 16px;
    }
    .totals { 
      margin-top: 25px; 
      padding: 20px; 
      background-color: white;
      border-radius: 8px;
      border: 2px solid #9CAF88;
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      margin: 8px 0; 
      padding: 5px 0;
    }
    .total-row.subtotal {
      color: #6B6B6B;
    }
    .total-row.shipping {
      color: #6B6B6B;
      border-bottom: 1px solid #E8E6E1;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .total-row.final { 
      font-weight: 700; 
      font-size: 18px; 
      color: #8B6F47;
      border-top: 2px solid #8B6F47;
      padding-top: 15px;
      margin-top: 15px;
    }
    .shipping-info { 
      background: linear-gradient(135deg, #F7F5F2 0%, #E8E6E1 100%); 
      padding: 20px; 
      border-radius: 8px; 
      margin: 25px 0; 
      border: 1px solid #E8E6E1;
    }
    .shipping-info h3 {
      color: #8B6F47;
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .address {
      background-color: white;
      padding: 15px;
      border-radius: 6px;
      border-left: 3px solid #9CAF88;
      margin: 10px 0;
    }
    .status-badge { 
      display: inline-block; 
      background: linear-gradient(135deg, #8B6F47 0%, #A68B6A 100%); 
      color: white; 
      padding: 8px 16px; 
      border-radius: 20px; 
      font-weight: 600; 
      text-transform: uppercase; 
      font-size: 12px; 
      letter-spacing: 0.5px;
    }
    .cta-section {
      background: linear-gradient(135deg, #9CAF88 0%, #B8C5A6 100%);
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
    }
    .cta-section h3 {
      color: white;
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .cta-section p {
      color: white;
      margin: 0;
      opacity: 0.9;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      padding: 25px 20px; 
      background-color: #F7F5F2;
      border-radius: 8px;
      color: #6B6B6B; 
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
    }
    .footer .brand {
      color: #8B6F47;
      font-weight: 600;
      font-size: 16px;
    }
    
    /* Mobile responsiveness */
    @media only screen and (max-width: 600px) {
      .container { padding: 10px; }
      .content { padding: 20px 15px; }
      .order-details { padding: 20px 15px; }
      .order-info { grid-template-columns: 1fr; }
      .items-table th, .items-table td { padding: 10px 8px; }
      .header h1 { font-size: 24px; }
      .totals { padding: 15px; }
    }
  </style>
`;

// Generate order confirmation email HTML
export const generateOrderConfirmationHTML = (data: OrderConfirmationData): string => {
  const { order, subtotal, shippingCost, totalAmount } = data;
  
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>
        <img src="${item.image}" alt="${item.title}" class="painting-image">
      </td>
      <td>
        <div class="painting-title">${item.title}</div>
        <div class="painting-details">Original Artwork</div>
      </td>
      <td style="text-align: right;">
        <span class="price">$${item.price.toFixed(2)}</span>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${order.orderNumber}</title>
      ${baseEmailStyles}
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase! Your order has been received.</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              
              <div class="order-info">
                <div class="order-info-item">
                  <div class="order-info-label">Order Number</div>
                  <div class="order-info-value">${order.orderNumber}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Order Date</div>
                  <div class="order-info-value">${order.createdAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Customer</div>
                  <div class="order-info-value">${order.customer.name}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Email</div>
                  <div class="order-info-value">${order.customer.email}</div>
                </div>
              </div>
              
              <h3>Artwork Ordered</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Painting</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <div class="totals">
                <div class="total-row subtotal">
                  <span>Subtotal:</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row shipping">
                  <span>Shipping:</span>
                  <span>${shippingCost === 0 ? 'FREE' : '$' + shippingCost.toFixed(2)}</span>
                </div>
                <div class="total-row final">
                  <span>Total:</span>
                  <span>$${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="shipping-info">
              <h3>Shipping Address</h3>
              <div class="address">
                ${order.customer.name}<br>
                ${order.shipping.address}<br>
                ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}<br>
                ${order.shipping.country}
              </div>
              <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
            </div>
            
            <div class="cta-section">
              <h3>What's Next?</h3>
              <p>We'll begin processing your order immediately. You'll receive a shipping confirmation email with tracking information once your artwork is on its way.</p>
            </div>
            
            <div class="order-details">
              <p>If you have any questions about your order, please contact us with your order number: <strong>${order.orderNumber}</strong></p>
              <p>We're excited for you to receive your new artwork!</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">Thank you for supporting our art!</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate order status update email HTML
export const generateOrderStatusUpdateHTML = (order: IOrder, newStatus: string, message: string): string => {
  const statusColors = {
    pending: '#9CAF88',
    processing: '#8B6F47',
    shipped: '#7A8F6B',
    delivered: '#6B5537'
  };

  const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#9CAF88';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - ${order.orderNumber}</title>
      ${baseEmailStyles}
      <style>
        .status-badge { 
          background: ${statusColor} !important;
        }
        .status-header {
          background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}CC 100%);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header status-header">
            <h1>Order Update</h1>
            <p>Your order status has been updated</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <p>Hello ${order.customer.name},</p>
              <p style="font-size: 16px; margin: 20px 0;">${message}</p>
              
              <div class="order-info">
                <div class="order-info-item">
                  <div class="order-info-label">Order Number</div>
                  <div class="order-info-value">${order.orderNumber}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">New Status</div>
                  <div class="order-info-value">
                    <span class="status-badge">${newStatus}</span>
                  </div>
                </div>
              </div>
              
              ${newStatus === 'shipped' ? `
                <div class="shipping-info">
                  <h3>Shipping Information</h3>
                  <div class="address">
                    <strong>Shipping to:</strong><br>
                    ${order.customer.name}<br>
                    ${order.shipping.address}<br>
                    ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}<br>
                    ${order.shipping.country}
                  </div>
                  <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
                  <p style="font-size: 14px; color: #6B6B6B; margin-top: 15px;">
                    You'll receive tracking information via email once your package is in transit.
                  </p>
                </div>
              ` : ''}
              
              ${newStatus === 'delivered' ? `
                <div class="cta-section">
                  <h3>We Hope You Love Your New Artwork!</h3>
                  <p>Your order has been delivered. We'd love to hear your thoughts about your new piece.</p>
                </div>
              ` : ''}
              
              <p>If you have any questions about your order, please contact us with your order number: <strong>${order.orderNumber}</strong></p>
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">Thank you for supporting our art!</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate plain text version for order confirmation
export const generateOrderConfirmationText = (data: OrderConfirmationData): string => {
  const { order, subtotal, shippingCost, totalAmount } = data;
  
  return `
Order Confirmation - ${order.orderNumber}

Thank you for your purchase!

ORDER DETAILS
Order Number: ${order.orderNumber}
Order Date: ${order.createdAt.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Customer: ${order.customer.name}
Email: ${order.customer.email}

ARTWORK ORDERED
${order.items.map(item => `- ${item.title}: $${item.price.toFixed(2)}`).join('\n')}

ORDER SUMMARY
Subtotal: $${subtotal.toFixed(2)}
Shipping: ${shippingCost === 0 ? 'FREE' : '$' + shippingCost.toFixed(2)}
Total: $${totalAmount.toFixed(2)}

SHIPPING ADDRESS
${order.customer.name}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
${order.shipping.country}

Estimated Delivery: 5-7 business days

WHAT'S NEXT?
We'll begin processing your order immediately. You'll receive a shipping confirmation email with tracking information once your artwork is on its way.

If you have any questions about your order, please contact us with your order number: ${order.orderNumber}

We're excited for you to receive your new artwork!

Thank you for supporting our art!

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.
  `.trim();
};

// Generate plain text version for order status update
export const generateOrderStatusUpdateText = (order: IOrder, newStatus: string, message: string): string => {
  return `
Order Update - ${order.orderNumber}

Hello ${order.customer.name},

${message}

Order Number: ${order.orderNumber}
New Status: ${newStatus.toUpperCase()}

${newStatus === 'shipped' ? `
SHIPPING INFORMATION
Shipping to:
${order.customer.name}
${order.shipping.address}
${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
${order.shipping.country}

Estimated Delivery: 5-7 business days
You'll receive tracking information via email once your package is in transit.
` : ''}

${newStatus === 'delivered' ? `
We hope you love your new artwork! We'd love to hear your thoughts about your new piece.
` : ''}

If you have any questions about your order, please contact us with your order number: ${order.orderNumber}

Thank you for your business!

---
Thank you for supporting our art!
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.
  `.trim();
};

// Generate contact confirmation email HTML (sent to customer)
export const generateContactConfirmationHTML = (contact: IContact): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact Form Received - ${contact.contactNumber}</title>
      ${baseEmailStyles}
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
            <p>We have received your inquiry and will reach out to you soon.</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h2>Your Contact Details</h2>
              
              <div class="order-info">
                <div class="order-info-item">
                  <div class="order-info-label">Reference Number</div>
                  <div class="order-info-value">${contact.contactNumber}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Submitted On</div>
                  <div class="order-info-value">${contact.createdAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Full Name</div>
                  <div class="order-info-value">${contact.customer.fullName}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Email</div>
                  <div class="order-info-value">${contact.customer.email}</div>
                </div>
              </div>
              
              <h3>Your Query</h3>
              <div class="address">
                ${contact.query.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="cta-section">
              <h3>What's Next?</h3>
              <p>We typically respond to inquiries within 24-48 hours. We'll reach out to you using the contact information you provided.</p>
            </div>
            
            <div class="order-details">
              <p>If you need to reference this inquiry, please use the reference number: <strong>${contact.contactNumber}</strong></p>
              <p>Thank you for your interest in our artwork!</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">AuraByShenoi</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate contact notification email HTML (sent to artist)
export const generateContactNotificationHTML = (contact: IContact): string => {
  const submissionTime = contact.createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission - ${contact.contactNumber}</title>
      ${baseEmailStyles}
      <style>
        .urgent-header {
          background: linear-gradient(135deg, #8B6F47 0%, #A68B6A 100%);
        }
        .contact-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .contact-detail-card {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #9CAF88;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .contact-detail-label {
          font-size: 12px;
          color: #6B6B6B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .contact-detail-value {
          font-size: 16px;
          color: #3A3A3A;
          font-weight: 500;
          word-break: break-word;
        }
        .query-section {
          background: linear-gradient(135deg, #F7F5F2 0%, #E8E6E1 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border: 2px solid #9CAF88;
        }
        .query-text {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          font-size: 16px;
          line-height: 1.6;
          color: #3A3A3A;
          white-space: pre-wrap;
          word-wrap: break-word;
          border-left: 4px solid #8B6F47;
        }
        .priority-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8B6F47 0%, #A68B6A 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
        }
        @media only screen and (max-width: 600px) {
          .contact-details-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header urgent-header">
            <h1>🔔 New Contact Form Submission</h1>
            <p>A potential customer has reached out through your website</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <div class="priority-badge">New Inquiry</div>
              
              <h2>Contact Information</h2>
              
              <div class="order-info">
                <div class="order-info-item">
                  <div class="order-info-label">Reference Number</div>
                  <div class="order-info-value">${contact.contactNumber}</div>
                </div>
                <div class="order-info-item">
                  <div class="order-info-label">Submitted On</div>
                  <div class="order-info-value">${submissionTime}</div>
                </div>
              </div>
              
              <h3>Customer Contact Details</h3>
              <div class="contact-details-grid">
                <div class="contact-detail-card">
                  <div class="contact-detail-label">Full Name</div>
                  <div class="contact-detail-value">${contact.customer.fullName}</div>
                </div>
                <div class="contact-detail-card">
                  <div class="contact-detail-label">Email Address</div>
                  <div class="contact-detail-value">
                    <a href="mailto:${contact.customer.email}" style="color: #8B6F47; text-decoration: none;">
                      ${contact.customer.email}
                    </a>
                  </div>
                </div>
                <div class="contact-detail-card">
                  <div class="contact-detail-label">Phone Number</div>
                  <div class="contact-detail-value">
                    <a href="tel:${contact.customer.phone}" style="color: #8B6F47; text-decoration: none;">
                      ${contact.customer.phone}
                    </a>
                  </div>
                </div>
                <div class="contact-detail-card">
                  <div class="contact-detail-label">Address</div>
                  <div class="contact-detail-value">${contact.customer.address}</div>
                </div>
              </div>
              
              <div class="query-section">
                <h3 style="color: #8B6F47; margin: 0 0 15px 0; font-size: 18px;">Customer Query</h3>
                <div class="query-text">${contact.query.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            
            <div class="cta-section">
              <h3>📞 Action Required</h3>
              <p>Please respond to this customer inquiry within 24-48 hours. You can reach them directly using the contact information provided above.</p>
            </div>
            
            <div class="order-details">
              <h3 style="color: #8B6F47;">Quick Response Tips:</h3>
              <ul style="color: #6B6B6B; line-height: 1.6;">
                <li>Acknowledge receipt of their inquiry</li>
                <li>Answer their specific questions</li>
                <li>Provide any additional information they might need</li>
                <li>Include your contact information for follow-up</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p class="brand">AuraByShenoi Admin Notification</p>
          <p>This automated notification was sent within 2 minutes of form submission.</p>
          <p>© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate contact confirmation email text (sent to customer)
export const generateContactConfirmationText = (contact: IContact): string => {
  return `
Contact Form Received - ${contact.contactNumber}

Thank you for contacting us!

CONTACT DETAILS
Reference Number: ${contact.contactNumber}
Submitted On: ${contact.createdAt.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Full Name: ${contact.customer.fullName}
Email: ${contact.customer.email}

YOUR QUERY
${contact.query}

WHAT'S NEXT?
We typically respond to inquiries within 24-48 hours. We'll reach out to you using the contact information you provided.

If you need to reference this inquiry, please use the reference number: ${contact.contactNumber}

Thank you for your interest in our artwork!

---
AuraByShenoi
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.
  `.trim();
};

// Generate contact notification email text (sent to artist)
export const generateContactNotificationText = (contact: IContact): string => {
  const submissionTime = contact.createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
🔔 NEW CONTACT FORM SUBMISSION - ${contact.contactNumber}

A potential customer has reached out through your website.

CONTACT INFORMATION
Reference Number: ${contact.contactNumber}
Submitted On: ${submissionTime}

CUSTOMER CONTACT DETAILS
Name: ${contact.customer.fullName}
Email: ${contact.customer.email}
Phone: ${contact.customer.phone}
Address: ${contact.customer.address}

CUSTOMER QUERY
${contact.query}

📞 ACTION REQUIRED
Please respond to this customer inquiry within 24-48 hours using their provided contact information.

QUICK RESPONSE TIPS:
• Acknowledge receipt of their inquiry
• Answer their specific questions
• Provide any additional information they might need
• Include your contact information for follow-up

---
AuraByShenoi Admin Notification
This automated notification was sent within 2 minutes of form submission.
© ${new Date().getFullYear()} AuraByShenoi. All rights reserved.
  `.trim();
};