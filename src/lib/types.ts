import { Types } from "mongoose";

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

export type ProductQuery = {
    vendorId?: string;
    material?: string | string[];
    shape?: string | string[];
    style?: string | string[];
    search?: string;
    gender?: string | string[];
    frame_color?: string | string[];
    size?: string | string[];
    temple_color?: string;
    lens_color?: string;
    //Contact lens specific filters :
    disposability?: string | string[];
    type?: string | string[];
    lens_per_box?: number | number[];
    color?: string | string[];
    is_Power?: boolean;
};


export interface PopulatedOrderItem {
    _id: Types.ObjectId;

    userId: {
        _id: Types.ObjectId;
        first_name: string;
        last_name: string;
        phone: string;
        email: string;
    };

    items: {
        _id: Types.ObjectId;
        onModel: "Product";
        variantId: Types.ObjectId;
        vendorId: Types.ObjectId;
        productName: string;
        price: number;
        quantity: number;

        productId: {
            _id: Types.ObjectId;
            productCode: string;
            brand_name: string;
            variants: {
                _id: Types.ObjectId;
                price: {
                    total_price: number;
                };
                images: {
                    _id: Types.ObjectId;
                    url: string;
                }[];
            }[];
        };

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
    }[];

    payment_attempts: Types.ObjectId[];

    shipping_address: {
        address_line_1: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };

    order_status: "pending" | "processing" | "ready_to_ship" | "shipped" | "delivered" | "cancelled";
    total_amount: number;
    tax: number;
    shipping_cost: number;
    coupon_code: string;
    discount: number;
    orderCode: string;

    createdAt: Date;
    updatedAt: Date;
}
