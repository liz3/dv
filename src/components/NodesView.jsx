import React, { useMemo, useState } from "react";
import { styled } from "goober";

const NodeViewWrapper = styled("div")`
  width: 100%;
  flex-grow: 1;
  padding: 10px 0 0 0;
  overflow-y: auto;
  & > div:not(:last-child)::after {
    content: "";
    width: 5px;
    height: 1px;
    background: white;
    position: absolute;
    right: -6px;
    top: 50%;
  }
  & > div:not(:first-child)::before {
    content: "";
    width: 5px;
    height: 1px;
    background: white;
    position: absolute;
    left: -6px;
    top: 50%;
  }
`;

const NodeStyle = styled("div")`
padding: 4px;
margin: 10px 5px;
border-radius: 5px;
position: relative;
min-height: 30px;
flex-shrink: 1;
display: inline-flex;

min-width: 50px;
background: #131212;
border: 1px solid ${({ $typeColor }) => $typeColor};

& .name-container, & .colon {
   color #9d9d9dc7;
}
& .array-len {
  color: ${({ $typeColor }) => $typeColor};
}

& .type-box {
    position: absolute;
    top: 0;
    left: 50%;
    font-size: 12px;
    border-radius: 5px;
   padding: 2px 5px;
    transform: translate(-50%, -75%);
    text-align: center;
    display: none;
   color: white;
                                                 white-space: nowrap;
background: ${({ $typeColor }) => $typeColor};

}
&:hover {
   & > .type-box {
        display: block;
    }
}
`;
const TYPE_COLORS = {
  read: "#b1b1b1",
  cStr: "#b1b1b1",
  padding: "#818181",
  u8: "#4fc1ff",
  u16: "#4fc1ff",
  u32: "#4fc1ff",
  u64: "#4fc1ff",
  s8: "#293fcc",
  s16: "#293fcc",
  s32: "#293fcc",
  s64: "#293fcc",
  f32: "#c156ff",
  f64: "#ffdc1a",
  array: "#57c441",
  custom: "#db4242",
  bitField: "#a8328b",
};

const ValueStyle = styled("div")`
  display: inline-block;
  margin-left: 2px;
  & > span {
    color: ${({ $typeColor }) => $typeColor};
  }
  &:hover > span {
    cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  }
`;
const PaddingBlock = styled("div")`
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  & > span {
    margin-right: 10px;
  }
  & > .sub-el:not(:last-child)::after {
    content: "";
    width: 5px;
    height: 1px;
    background: white;
    position: absolute;
    right: -6px;
    top: 50%;
  }
  & > .sub-el:not(:first-child)::before {
    content: "";
    width: 5px;
    height: 1px;
    background: white;
    position: absolute;
    left: -6px;
    top: 50%;
  }
  & > .sub-el {
    position: relative;
    padding-left: 5px;
    border: 1px solid #a19f9f;
    margin: 5px;
    & > .index-entry {
      color: #b9b6b6c2;
    }
  }
`;
const BitContainer = styled("div")`
  text-align: center;
  line-height: 20px;
  height: 16px;
  overflow: hidden;
  & div {
    margin: 0;
    font-size: 15px;
  }
  &:hover {
    height: auto;
  }
  & .index {
    color: white;
    margin-right: 3px;
  }
  & .active {
    color: #0acf0a;
  }
  & .off {
    color: #cd1a49;
  }
`;
const MAX_LENGTH = 200;
const StringValue = ({ node, color }) => {
  const [displayType, setDisplayType] = useState(1);
  const value = useMemo(() => {
    if (displayType === 1) return node.string.substr(0, MAX_LENGTH);
    const list = [];
    for (const byte of node.value) {
      list.push("0x" + byte.toString(16));
      if (list.length === MAX_LENGTH) break;
    }
    return list.join(",");
  }, [displayType, node]);
  return (
    <ValueStyle
      onClick={() => setDisplayType(displayType === 1 ? 2 : 1)}
      $clickable={true}
      $typeColor={color}
    >
      <span>
        {displayType === 1 ? "[str] " : "[hex] "}"{value}"
      </span>
    </ValueStyle>
  );
};
const CustomValue = ({ node }) => {
  const [showAll, setShowAll] = useState(false);
  const arrayValues = useMemo(() => {
    if (node.type !== "array") return null;
    const arr =
      showAll || node.values.length <= 5
        ? node.values
        : node.values.slice(0, 5);
    return arr.map((n, i) => (
      <div key={i} className={"sub-el"}>
        <span className={"index-entry"}>{i}:</span>
        {n.map((nn, ii) => (
          <Node key={ii} node={nn} />
        ))}
      </div>
    ));
  }, [node, showAll]);
  if (node.type === "array")
    return (
      <>
        <span onClick={() => setShowAll(!showAll)} className={"array-len"}>
          [{node.length}]
        </span>
        <PaddingBlock>{arrayValues}</PaddingBlock>
      </>
    );
  return (
    <PaddingBlock>
      <Node node={node.value} />
    </PaddingBlock>
  );
};

const BitFieldValue = ({ node, color }) => {
  return (
    <ValueStyle $typeColor={color}>
      <BitContainer>
        {(node.value || []).map((entry, i) => (
          <div key={i}>
            <span className={"index"}>{i}</span>
            {Object.values(entry).map((v, ii) => (
              <span key={ii} className={v ? "active" : "off"}>
                {v ? 1 : 0}
              </span>
            ))}
          </div>
        ))}
      </BitContainer>
    </ValueStyle>
  );
};
const Node = ({ node }) => {
  const { type, name, error } = node;
  const cc = error ? "#910000" : TYPE_COLORS[type];
  const valueRendered = useMemo(() => {
    if (error)
      return (
        <ValueStyle $typeColor={cc}>
          <span className={"error"}> Error: {error}</span>
        </ValueStyle>
      );
    if (type === "custom" || type === "array")
      return <CustomValue node={node} />;
    if (type === "read" || type === "cStr")
      return <StringValue node={node} color={cc} />;
    if (type === "bitField") return <BitFieldValue node={node} color={cc} />;
    return (
      <ValueStyle $typeColor={cc}>
        <span>
          {type === "u64" || type === "s64"
            ? node.value.toString()
            : node.value}
        </span>
      </ValueStyle>
    );
  }, [node]);
  return (
    <NodeStyle $typeColor={cc}>
      <div className={"type-box"}>
        <span>
          {type}{" "}
          {type !== "array" && type !== "custom"
            ? `${node.byteStart}-${node.byteStart + node.byteLength}`
            : ""}
        </span>
      </div>
      <span className={"name-container"}>{name}</span>
      <span className={"colon"}>:</span>
      {valueRendered}
    </NodeStyle>
  );
};

const NodeView = ({ nodes }) => {
  return (
    <NodeViewWrapper>
      {nodes.map((node, i) => (
        <Node node={node} key={i} />
      ))}
    </NodeViewWrapper>
  );
};
export default NodeView;
