import checkBitValues from "./BitField.mjs";
class BinaryStream {
  constructor(buffer) {
    this.buffer = buffer;
    this.endianess = 1;
    this.length = buffer.length;
    this.m_mark = null;
    this.resetBuffer();
  }
  resetBuffer() {
    this.offset = 0;
    this.remaining = this.buffer.length;
  }
  setEndianess(endianess) {
    this.endianess = endianess;
  }
  _advance(length) {
    if (this.remaining < length) return null;
    return () => {
      this.offset += length;
      this.remaining -= length;
    };
  }

  mark() {
    this.m_mark = this.offset;
  }
  rewindToMark() {
    if (this.m_mark === null) return;
    this.offset = this.m_mark;
    this.remaining = this.buffer.length - this.offset;
    this.m_mark = null;
  }
  setPos(length) {
    const newStart = length;
    if (newStart < 0 || newStart > this.buffer.length) return false;
    this.remaining = this.buffer.length - newStart;
    this.offset = newStart;
    return true;
  }
  skip(length) {
    const newStart = this.offset + length;
    if (newStart < 0 || newStart > this.buffer.length) return false;
    this.remaining = this.buffer.length - newStart;
    this.offset = newStart;
    return true;
  }
  buf() {
    return this.buffer;
  }
  _getEndianessName(name) {
    return `${name}${this.endianess === 1 ? "LE" : "BE"}`;
  }
  readBuff(length) {
    const a = this._advance(length);
    if (!a) return null;
    const result = this.buffer.subarray(this.offset, this.offset + length);
    a();
    return new BinaryStream(result);
  }
  read(length) {
    return this.readBuff(length).buf();
  }
  byte() {
    const res = this.read(1);
    if (!res) return null;
    return res.buf()[0];
  }
  bitField(length = 1) {
    const buf = this.read(length);
    if (!buf) return null;
    return checkBitValues(buf);
  }
  cStr(withNull = false) {
    let count = 0;
    while (count < this.remaining) {
      if (this.buffer[this.offset + count] === 0) break;
      count++;
    }
    if (withNull) count++;
    const str = this.read(count);
    if (!withNull) this.skip(1);
    return str;
  }
  u8() {
    const a = this._advance(1);
    if (!a) return null;
    const result = this.buffer.readUInt8(this.offset);
    a();
    return result;
  }
  s8() {
    const a = this._advance(1);
    if (!a) return null;
    const result = this.buffer.readInt8(this.offset);
    a();
    return result;
  }
  u16() {
    const a = this._advance(2);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readUInt16")](
      this.offset
    );
    a();
    return result;
  }
  s16() {
    const a = this._advance(2);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readInt16")](
      this.offset
    );
    a();
    return result;
  }
  u32() {
    const a = this._advance(4);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readUInt32")](
      this.offset
    );
    a();
    return result;
  }
  s32() {
    const a = this._advance(4);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readInt32")](
      this.offset
    );
    a();
    return result;
  }
  u64() {
    const a = this._advance(8);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readBigUInt64")](
      this.offset
    );
    a();
    return result;
  }
  s64() {
    const a = this._advance(8);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readBigInt64")](
      this.offset
    );
    a();
    return result;
  }
  f32() {
    const a = this._advance(4);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readFloat")](
      this.offset
    );
    a();
    return result;
  }
  f64() {
    const a = this._advance(8);
    if (!a) return null;
    const result = this.buffer[this._getEndianessName("readDouble")](
      this.offset
    );
    a();
    return result;
  }
}
export default BinaryStream;
