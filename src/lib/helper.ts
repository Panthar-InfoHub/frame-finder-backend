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
