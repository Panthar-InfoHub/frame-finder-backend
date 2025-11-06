import { OrderItem, ProductQuery } from "./types.js";

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

export const get_item_by_vendor = (orderItems: OrderItem[]) => {
    const item_by_vendor: { [vendorId: string]: any[] } = {};
    for (const item of orderItems) {
        const vendorId = item.vendorId.toString();

        if (!item_by_vendor[vendorId]) {
            item_by_vendor[vendorId] = [];
        }

        item_by_vendor[vendorId].push(item);
    }
    return item_by_vendor;
}

export const create_order_items = (wishListItems: any): OrderItem[] => {
    return wishListItems.items.map((item: any) => ({
        productId: item.product.id,
        onModel: item.onModel,
        variantId: item?.variant?._id || null,
        vendorId: item.product.vendorId._id,
        productName: item.product.brand_name,
        price: item?.variant?.price?.total_price || item.price.total_price,
        quantity: item.quantity,
        prescription: item.prescription,
        lens_package_detail: item.lens_package_detail,
        product_snapshot: {
            productCode: item.product.productCode,
            brand_name: item.product.brand_name,
            variant_details: {
                total_price: item?.variant?.price?.total_price || item.price.total_price,
                frame_color: item?.variant?.price?.frame_color || "",
                temple_color: item?.variant?.price?.temple_color || "",
                image_url: item?.variant?.images[0].url || item.images[0].url
            },
        },
        vendor_snapshot: {
            business_name: item.product.vendorId.business_name,
            business_owner: item.product.vendorId.business_owner,
        },
    }))
}

export const discount_price = (type: string, total_amount: number, coupon_value: number): number => {
    console.debug(`Type ==> ${type} | Total Amount ==> ${total_amount} | Coupon value ==> ${coupon_value}`)
    if (type === "percentage") {
        return (total_amount * coupon_value) / 100
    }
    return Math.min(total_amount, coupon_value);
}

export function getDateRange(periodName: string): { start: Date | null; end: Date } {
    const now = new Date();
    const end = now;
    let start: Date | null = null;

    switch (periodName) {
        case 'last_7_days':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;

        case 'last_15_days':
            start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            break;

        case 'last_30_days':
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;

        case 'last_60_days':
            start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            break;

        case 'last_90_days':
            start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;

        case 'last_month':
            const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            return { start: firstDayOfLastMonth, end: lastDayOfLastMonth };

        case 'current_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;

        case 'all_time':
            start = null;
            break;

        default:
            throw new Error(`Unknown period: ${periodName}`);
    }

    return { start, end };
}



export function buildProductFilter(query: ProductQuery) {
    let filter: any = { status: 'active' };

    // Search logic
    if (query.search) {
        const escapedSearch = query.search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        filter = {
            ...filter,
            $or: [
                { productCode: { $regex: escapedSearch, $options: 'i' } },
                { $text: { $search: query.search } }
            ]
        };
    }

    if (query.vendorId) {
        filter.vendorId = query.vendorId;
    }

    const addInFilter = (key: string, dbField: string, target: any = filter) => {
        if (query[key as keyof ProductQuery]) {
            const arr = (query[key as keyof ProductQuery] as string).split(',').map(s => s.trim());
            target[dbField] = { $in: arr };
        }
    };

    addInFilter('material', 'material');
    addInFilter('shape', 'shape');
    addInFilter('style', 'style');
    addInFilter('gender', 'gender');
    addInFilter('frame_color', 'variants.frame_color');
    addInFilter('temple_color', 'variants.temple_color');
    addInFilter('lens_color', 'variants.lens_color');

    return filter;
}
