import BinaryStream from "./BinaryStream.mjs";
const BYTE_LENGTH = {
  s8: 1,
  u8: 1,
  s16: 2,
  u16: 2,
  s32: 4,
  u32: 4,
  s64: 8,
  u64: 8,
  f32: 4,
  f64: 8,
};
const extract_value = (stream, elements, value) => {
  if (typeof value === "function") return value(stream, elements);
  return value;
};
const try_exec = (cb, o) => {
  let result = null;
  try {
    result = cb();
  } catch (err) {
    o.error = err.message;
  }
  return result;
};
const read_value = (stream, elements, field) => {
  const type = field.type;
  const isAbsolute = field.absolute_pos !== undefined;
  if (isAbsolute) {
    stream.mark();
    if (
      !stream.setPos(extract_config_value(stream, elements, field.absolute_pos))
    )
      return null;
  } else if (field.offset) {
    stream.mark();
    stream.skip(extract_config_value(stream, elements, field.offset));
  }
  let result = null;
  let len = null;
  if (type === "cStr") {
    result = stream[type](field.withNull);
    len = result.length + (field.withNull ? 0 : 1);
  } else {
    if (field.len) {
      len = extract_config_value(stream, elements, field.len);
    } else if (BYTE_LENGTH[type]) {
      len = BYTE_LENGTH[type];
    }
    if (stream.remaining < len)
      throw new Error("eof few bytes " + (len - stream.remaining));
    else result = stream[type](len);
  }

  if (isAbsolute || field.offset) {
    stream.rewindToMark();
  }
  return result;
};
const extract_config_value = (stream, elements, value) => {
  if (typeof value === "object" && value !== null)
    return tr(() => read_value(stream, elements, value), value);
  return extract_value(stream, elements, value);
};
export const transform = (stream, config, parentElements = []) => {
  const elements = [];
  if (config.endianess) stream.setEndianess(config.endianess === "big" ? 2 : 1);
  for (const field of config.fields) {
    const { name, props } = field;
    const o = {
      name,
      type: field.type,
      byteStart: stream.offset,
      error: null,
      props,
    };
    const isEnd = stream.remaining === 0;
    if (isEnd) {
      o.error = "eof";
      elements.push(o);
      continue;
    }
    if (
      field.condition &&
      !field.condition(stream, [...parentElements, ...elements])
    ) {
      o.error = "condition_failed";
      elements.push(o);
      continue;
    }
    if (field.type === "array") {
      let array_len = extract_config_value(
        stream,
        [...parentElements, ...elements],
        field.len
      );
      const array_elements = [];

      if (typeof array_len === "number" && array_len >= 0) {
        o.length = array_len;
        for (let i = 0; i < array_len; i++) {
          const entry = transform(stream, field, [
            ...parentElements,
            ...elements,
          ]);
          array_elements.push(entry);
        }
      } else {
        if (array_len < 0) o.error = "negative array len " + array_len;
        else o.length = 0;
      }

      o.values = array_elements;
    } else if (field.type === "padding") {
      const size = try_exec(
        () =>
          extract_config_value(
            stream,
            [...parentElements, ...elements],
            field.len
          ),
        o
      );
      o.value = size;
      o.byteLength = size;

      if (typeof size === "number" && size >= 0) {
        stream.skip(size);
      } else if (size < 0) {
        o.error = "negative size";
      }
    } else if (field.type === "custom") {
      const computed = try_exec(
        () => field.compute(stream, [...parentElements, ...elements]),
        o
      );
      if (
        computed.type !== "padding" &&
        computed.type !== "array" &&
        computed.type !== "custom" &&
        !field.noHide
      ) {
        elements.push(computed);
        continue;
      }
      o.value = computed;
    } else {
      o.value = try_exec(
        () => read_value(stream, [...parentElements, ...elements], field),
        o
      );
      o.byteLength = BYTE_LENGTH[field.type] || o.value?.length;
      if (field.type === "cStr" || field.type === "read") {
        o.string = o.value.toString();
      }
    }
    elements.push(o);
  }
  return elements;
};
const transformBuffer = (buffer, config) => {
  try {
    const stream = new BinaryStream(buffer);
    stream.config_vars = config.vars;
    return transform(stream, config);
  } catch (err) {
    return [
      {
        type: "u8",
        name: "Error",
        value: null,
        error: err.message,
      },
    ];
  }
};

export default transformBuffer;
