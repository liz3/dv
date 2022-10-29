# dv

Visualisation tool for Binary files

![dv](/assets/screenshot.png)

# How does it work?

DV takes a "model", a Javascript object(not json as it can contain functions) which defines a part or a complete structure of a binary file  
It then uses that model to analyse the file and give a "Node view" of the actual values within the file of the model.

# How does the model work?

The model is the structure which dv uses to analyse binary files, it contains the definitions for all fields which are expected in a file.

A very simple model would look like:

```
({
    name: "some model",
    endianess: "little",
    fields: [{
        type: "read",
        name: "magic",
        len: 4
    }, {
        type: "f32",
        name: "Some Number",
    }],
})

```

If you look at the fields it comes obvious neither fields have absolute byte positions, thats not needed as dv wraps nodes Buffer
in a stream api.
As a side fact, the `type` of a model is actually a implicit function name within the Stream api, as except in some special cases
the type is a existing function within the stream api.

# Supported model properties

This is a full list and explanation of the available types that can be put on a **FIELD** of a model.

Before we go over this, most properties can be passed a value or a function which dv will invoke during mapping of the file.  
that function is **not** awaited, it needs to be syncronized, further it can have two arguments:

1. `stream`: This is the instance of the stream for use by the function, **careful** as using stream functions like resetBuffer/skip/mark/rewindToMark can break the expected flow of the model
   through the file.
2. `elements`: This is a array of all until now computed nodes, this might be needed when functions depend on prior values.

Here are some general available properties on fields.

- `type:TypeString`: The type of the field, see below for a list of types
- `name:string`: The name for the field
- [optional]`absolute_pos:(number/function:number)`: Compute/provide the absolute offset for a field, note that after computation the stream will automatically rewind to the starting position.
- [optional]`offset:(number/function:number)`: Compute/provide a relative offset from the current position.
- [optional]`condition(boolean/function:boolean)`: A precondition if the field should be computed, if this is true, it will still be visible in the node view but there will be no computation, i.e no stream pos modifications etc.

### Numbers

Available Type Strings: `u8, s8, u16, s16, u32, s32, u64, s64, f32, f64`  
These follow a very simple structure, the first character indicates the type. u = unsigned, s = signed, f = floating point. The number then indicates the size in bits.

### Simple buffer

TypeString: `read`  
Required properties:

- `len:(number/function:number)`: The buffer length in bytes

### C-Style string

TypeString: `cStr`
Optional properties:

- `withNull:boolean`: Control if the NULL byte should be included in the data, otherwise it will be silently skipped  
  Reads a C-Style null byte terminated string.

### BitField

TypeString: `bitField`  
Required Properties:

- `len:(number/function:number)`: The Bit Field length in BYTES.
  This reads the given amount of bytes and will display them as a 0/1 bit field view, this can be used for bit flags.

### Padding

TypeString: `padding`  
Required Properties:

- `len:(number/function:number)`: The padding size in BYTES.
  This simply skips the given amount of bytes.

### Array

TypeString: `array`
Required Properties:

- `len:(number/function:number)`: The arrays length in elements
- `fields:field[]`: The array definition, this is a list of fields again which are supported

This is a tool for repeated patterns of structures, internally dv will recurse the transform function with the given array definitions.

### Custom

TypeString: `custom`
Required Properties:

- `compute:(function:nodeValue)`: The function which computes the custom result

Custom is special as it basically gives the control to the callee, custom is not made to give reading instruction but to perform the parsing yourself and only returned computed result.  
Refer to nodeValue below.

# NodeValue

This structure is only used for custom fields, but it is important to get this right as the renderer might make certain assumptions about the structure of the data!

### General Properties Properties:

- `type:TypeString`: The type of the node
- `name:string`: The name of the node
- [optional]`error:string`: A error which occured during value computation for this node

### Numbers

Required Properties:

- `value:(number/bigint)`: The value for the number, be aware 64bit values need to be provided as BigInt

### C-Style string/read

Required Properties:

- `value:Buffer`: The value as Node Buffer
- `string:string`: The value as string

### Padding

Required Properties:

- `value:(number/bigint)`: The value for the number of skipped bytes.

### Array

Required Properties:

- `values:(nodeValue[][])`: 2D Array representing the computed results
- `length:number`: The count of elements, not the amount of nodeValues per item but the item amoount.
  Note that here every item in the list should have the same sub structure of node values, try to avoid differences in properties other then value.

# Running

```
npm i
npm run dev
```

Note that you will probably have to reload the site within the electron window as electron will be trying to load before the react dev server is ready.
