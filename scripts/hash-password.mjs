import bcrypt from "bcryptjs";

const password = "test1234";
const hash = await bcrypt.hash(password, 12);
console.log(hash);
