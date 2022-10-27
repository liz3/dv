import React from "react";
import useDataState from "../common/useDataState.mjs";
import DataState from "../common/DataState.mjs";
import { styled } from "goober";

const WrapperStyle = styled("div")`
  width: 100%;
  min-height: 30px;
  background: #262525;
  display: flex;
`;
const TabStyle = styled("div")`
  padding: 5px 8px;
  height: 100%;
  background: ${({ $active }) => ($active ? "#1f1e1e" : "#262525")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  & .close {
    margin-left: 5px;
  }
  &:hover {
    cursor: pointer;
    background: #1f1e1e;
  }
`;
const TabView = () => {
  const activeFile = useDataState("activeFile");
  const files = useDataState("files");
  return (
    <WrapperStyle>
      {files
        ? Object.values(files).map((file) => (
            <TabStyle
              onClick={() => DataState.set_active_file(file)}
              $active={activeFile === file}
              key={file.id}
            >
              <span>{file.file.name}</span>
              <span
                className={"close"}
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  DataState.delete_file(file);
                }}
              >
                X
              </span>
            </TabStyle>
          ))
        : null}
    </WrapperStyle>
  );
};
export default TabView;
