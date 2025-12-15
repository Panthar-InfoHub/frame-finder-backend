import { PopulatedOrderItem } from "./types.js"

interface OrderItem {
    productName: string
    price: number
    quantity: number
    product_snapshot: {
        productCode: string
        brand_name?: string
        variant_details?: {
            frame_color?: string
            temple_color?: string
            image_url?: string
        }
    }
    vendor_snapshot: {
        business_name: string
        business_owner: string
    }
}

interface OrderUpdateProps {
    data: PopulatedOrderItem
    trackingId?: string
}

const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: string }> = {
        pending: { label: "Pending", color: "#FFA500", icon: "⏳" },
        processing: { label: "Processing", color: "#4169E1", icon: "⚙️" },
        shipped: { label: "Shipped", color: "#00aa78", icon: "🚚" },
        delivered: { label: "Delivered", color: "#00aa78", icon: "✓" },
        cancelled: { label: "Cancelled", color: "#DC3545", icon: "✕" },
    }
    return configs[status] || configs["pending"]
}

export const OrderUpdateEmailTemplate = (props: OrderUpdateProps) => {
    const { data } = props
    const statusConfig = getStatusConfig(data.order_status)

    const vendorDetails = data.items[0]?.vendor_snapshot || {
        business_name: "N/A",
        business_owner: "N/A",
    }

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
            border-top: 6px solid #00aa78;
          }
          .header {
            background-color: #00aa78;
            color: #fff;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .header-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .content {
            padding: 30px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #00aa78;
            margin-bottom: 12px;
          }
          .status-container {
            margin-bottom: 20px;
          }
          .status-label {
            font-size: 12px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }
          .status-badge {
            display: inline-block;
            background-color: ${statusConfig.color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .highlight-box {
            background-color: #f1fdf8;
            border-left: 4px solid #00aa78;
            padding: 12px 16px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 14px;
          }
          .vendor-section {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .vendor-section p {
            margin: 6px 0;
            font-size: 14px;
          }
          .label {
            font-weight: bold;
            color: #00aa78;
          }
          .value {
            margin-left: 8px;
          }
          .item-card {
            border: 1px solid #eee;
            border-radius: 6px;
            margin-bottom: 15px;
            overflow: hidden;
          }
          .item-header {
            background-color: #f8f9fa;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item-name {
            font-weight: bold;
            font-size: 14px;
            color: #333;
          }
          .item-code {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
          }
          .item-image {
            text-align: center;
            padding: 15px;
            background-color: #f9f9f9;
            border-bottom: 1px solid #eee;
          }
          .item-image img {
            max-width: 150px;
            height: auto;
            border-radius: 4px;
          }
          .item-body {
            padding: 15px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .item-row-label {
            font-weight: 600;
            color: #555;
          }
          .item-row-value {
            color: #333;
          }
          .item-total {
            border-top: 1px solid #eee;
            margin-top: 10px;
            padding-top: 10px;
            font-weight: bold;
            font-size: 15px;
            color: #00aa78;
          }
          .variant-detail {
            font-size: 13px;
            color: #666;
            margin: 4px 0;
          }
          .price-section {
            background-color: #f1fdf8;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .price-total {
            border-top: 2px solid #00aa78;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
            font-size: 16px;
            color: #00aa78;
          }
          .tracking-box {
            background-color: #fff3cd;
            border-left: 4px solid #FFC107;
            padding: 12px 16px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            padding: 20px;
            border-top: 1px solid #eee;
          }
          .cta-button {
            display: inline-block;
            background-color: #00aa78;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 15px;
            font-weight: bold;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2300aa78'/%3E%3Cpath d='M30 40 Q30 30 40 30 Q50 30 50 40 M50 40 Q50 30 60 30 Q70 30 70 40' stroke='white' strokeWidth='3' fill='none' strokeLinecap='round'/%3E%3Cpath d='M35 50 Q35 55 40 55 Q45 55 45 50' stroke='white' strokeWidth='2' fill='none'/%3E%3Cpath d='M55 50 Q55 55 60 55 Q65 55 65 50' stroke='white' strokeWidth='2' fill='none'/%3E%3C/svg%3E" alt="FrameFinder Logo" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div class="header-title">Order Update — FrameFinder</div>
          </div>
          <div class="content">
            <div class="section">
              <span class="status-label">Order Status</span>
              <div class="status-badge">${statusConfig.icon} ${statusConfig.label}</div>
              <div class="highlight-box">
                <strong>Order #${data.orderCode}</strong> has been ${statusConfig.label.toLowerCase()}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Vendor Details</div>
              <div class="vendor-section">
                <p><span class="label">Business Name:</span><span class="value">${vendorDetails.business_name}</span></p>
                <p><span class="label">Owner:</span><span class="value">${vendorDetails.business_owner}</span></p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Items</div>
              ${data.items
            .map(
                (item) => `
                <div class="item-card">
                  <div class="item-header">
                    <div>
                      <div class="item-name">${item.productName}</div>
                      <div class="item-code">Product Code: ${item.product_snapshot.productCode}</div>
                    </div>
                  </div>
                  ${item.product_snapshot.variant_details?.image_url
                        ? `
                    <div class="item-image">
                      <img src="${item.product_snapshot.variant_details.image_url}" alt="${item.productName}" />
                    </div>
                  `
                        : ""
                    }
                  <div class="item-body">
                    ${item.product_snapshot.brand_name ? `<div class="variant-detail"><strong>Brand:</strong> ${item.product_snapshot.brand_name}</div>` : ""}
                    ${item.product_snapshot.variant_details?.frame_color ? `<div class="variant-detail"><strong>Frame Color:</strong> ${item.product_snapshot.variant_details.frame_color}</div>` : ""}
                    ${item.product_snapshot.variant_details?.temple_color ? `<div class="variant-detail"><strong>Temple Color:</strong> ${item.product_snapshot.variant_details.temple_color}</div>` : ""}
                    
                    <div class="item-row" style="margin-top: 10px;">
                      <span class="item-row-label">Price per unit:</span>
                      <span class="item-row-value">₹${item.price.toFixed(2)}</span>
                    </div>
                    <div class="item-row">
                      <span class="item-row-label">Quantity:</span>
                      <span class="item-row-value">${item.quantity}</span>
                    </div>
                    <div class="item-total">
                      Item Total: ₹${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              `,
            )
            .join("")}
            </div>

            ${props.trackingId
            ? `
              <div class="section">
                <div class="tracking-box">
                  <strong>Tracking ID:</strong> ${props.trackingId}
                </div>
              </div>
            `
            : ""
        }

            <div class="price-section">
              <div class="price-row">
                <span>Subtotal</span>
                <span>₹${data.total_amount.toFixed(2)}</span>
              </div>
              <div class="price-row">
                <span class="price-total">Total Amount</span>
                <span class="price-total">₹${data.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="#" class="cta-button">View Order Details</a>
            </div>
          </div>

          <div class="footer">
            © 2025 FrameFinder. All rights reserved. | This is an automated email notification.
          </div>
        </div>
      </body>
    </html>
  `

    return htmlBody
}
