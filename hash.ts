const bcrypt = require('bcrypt');

const saltRounds = 10;
const plainPassword = 'password123';

const run = async () => {
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Hashed Password:', hashedPassword);
};

run();