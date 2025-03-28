const { hash } = require('bcryptjs');

async function generateHash() {
  const password = 'JustinBillson1995';
  const hashedPassword = await hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

generateHash().catch(console.error); 