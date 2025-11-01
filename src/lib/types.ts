export interface OrderItem {
    productId: string;
    onModel: string;
    variantId: string;
    vendorId: string;
    productName: string;
    price: number;
    quantity: number;
    prescription: any;
    lens_package_detail: any;
    product_snapshot: {
        productCode: string;
        brand_name: string;
        variant_details: {
            total_price: number;
            frame_color: string;
            temple_color: string;
            image_url: string;
        };
    };
    vendor_snapshot: {
        business_name: string;
        business_owner: string;
    };
}

export interface CouponBreakdown {
    valid: boolean;
    coupon: {
        code: string;
        type: string;
        value: number;
        scope: string;
        vendorId?: string;
    };
    discount_price: number;
    total_amount: number;
    message: string;
    vendorId?: string;
}