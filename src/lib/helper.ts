import { OrderItem } from "./types.js";

export const generatePassword = (type: string): string => {
    let password = "";

    if (type === "vendor") {
        password += "VEND_"
    }

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * 10);
        password += randomIndex
    }
    return password;
};

export function generateReadableProductCode(prefix: string): string {
    const timestamp = Date.now().toString(36).slice(-5);
    const random = Math.random().toString(36).substring(2, 5);

    return `${prefix}-${timestamp}${random}`.toUpperCase(); // e.g., FRM-1A2B3
}

export const create_order_items = (wishListItems: any): OrderItem[] => {
    return wishListItems.map((item: any) => ({
        productId: item.product.id,
        onModel: item.onModel,
        variantId: item.variant._id,
        vendorId: item.product.vendorId._id,
        productName: item.product.brand_name,
        price: item.variant.price.total_price,
        quantity: item.quantity,
        prescription: item.prescription,
        lens_package_detail: item.lens_package_detail,
        product_snapshot: {
            productCode: item.product.productCode,
            brand_name: item.product.brand_name,
            variant_details: {
                total_price: item.variant.price.total_price,
                frame_color: item.variant.price.frame_color,
                temple_color: item.variant.price.temple_color,
                image_url: item.variant.images[0].url
            },
        },
        vendor_snapshot: {
            business_name: item.product.vendorId.business_name,
            business_owner: item.product.vendorId.business_owner,
        },
    }))
}

export const discount_price = (type: string, total_amount: number, coupon_value: number): number => {
    if (type === "percentage") {
        return (total_amount * coupon_value) / 100
    }
    return Math.min(total_amount, coupon_value);
}
