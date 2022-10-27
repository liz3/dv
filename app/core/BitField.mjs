function check_bit(number, index) {
  return Boolean(number & (1 << index));
}
const check_bit_values = (buffer) => {
  const values = [];
  for (const byte of buffer.entries()) {
    const [_, byteValue] = byte;
    const v = {};
    for (let i = 0; i < 8; i++) {
      v[i] = check_bit(byteValue, i);
    }
    values.push(v);
  }
  return values;
};
export default check_bit_values;
