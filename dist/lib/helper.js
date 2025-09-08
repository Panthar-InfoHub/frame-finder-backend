export const generatePassword = (type) => {
    let password = "";
    if (type === "vendor") {
        password += "VEND_";
    }
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * 10);
        password += randomIndex;
    }
    return password;
};
export function generateReadableProductCode(prefix) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`.toUpperCase();
    // Example: FRA1A2B3C4D5E6F7G8H9 
}
