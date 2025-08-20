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
