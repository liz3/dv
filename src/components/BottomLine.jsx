import React, { useMemo, useState } from "react";
import useDataState from "../common/useDataState.mjs";
import DataState from "../common/DataState.mjs";

import { styled } from "goober";

const WrapperStyle = styled("div")`
  padding: 0 5px;
  width: 100%;
  height: 20px;
  min-height: 20px;

  border-top: 1px solid #333232;
  display: flex;
  align-items: center;
  & span {
    color: #bababa;
    font-size: 0.8rem;
    margin-right: 10px;
  }
  > .clickable:hover {
    cursor: pointer;
  }
`;
const BottomLine = ({}) => {
  const activeFile = useDataState("activeFile");

  return (
    <WrapperStyle>
      {activeFile ? (
        <>
          <span
            className={"clickable"}
            onClick={() => {
              if (!activeFile.nodes) return;
              DataState.setMode(activeFile.mode === "hex" ? "nodes" : "hex");
            }}
          >
            {activeFile.mode === "hex" ? "Hex View" : "Node View"}
          </span>
          <span
            className={"clickable"}
            onClick={() => {
              DataState.toggle_editor_visible();
            }}
          >
            {activeFile.editorVisible ? "Hide Editor" : "Show editor"}
          </span>

          <span>{activeFile.file.path}</span>
        </>
      ) : null}
    </WrapperStyle>
  );
};
export default BottomLine;
