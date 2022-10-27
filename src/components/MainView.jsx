import React, { useMemo, useState, useRef, useEffect } from "react";
import useDataState from "../common/useDataState.mjs";
import DataState from "../common/DataState.mjs";
import { styled } from "goober";
import HexView from "./HexView.jsx";
import Editor from "./Editor.mjs";
import NodeView from "./NodesView.jsx";

const WrapperStyle = styled("div")`
  width: 100%;
  flex: 1;
  max-height: calc(100% - 50px);
  .main-content {
    width: 100%;
    height: 100%;
  }
`;
const EmptyContainerStyle = styled("div", React.forwardRef)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  & h2 {
    color: #424242;
  }
`;
const MainViewStyle = styled("div", React.forwardRef)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
const ResizeBarWrapper = styled("div", React.forwardRef)`
  display: flex;
  border-top: 1px solid #333232;
  border-bottom: 1px solid #333232;
  height: 10px;
  padding: 2px;
  &:hover {
    cursor: ns-resize;
  }
`;
const ResizeBar = ({ file, onResize, viewRef }) => {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !viewRef.current) return;
    let clicking = false;
    const listeners = [
      [
        "mousedown",
        (ev) => {
          clicking = true;
        },
      ],
      [
        "mouseup",
        (ev) => {
          clicking = false;
        },
        true,
      ],
      [
        "mousemove",
        (ev) => {
          if (clicking) {
            ev.preventDefault();
            const rect = viewRef.current.getBoundingClientRect();
            onResize(rect.height + 30 - ev.clientY);
          }
        },
        true,
      ],
    ];
    for (const [k, v, w] of listeners)
      (w ? window : ref.current).addEventListener(k, v);
    return () => {
      for (const [k, v, w] of listeners)
        (w ? window : ref.current)?.removeEventListener(k, v);
    };
  }, [ref, viewRef]);
  return <ResizeBarWrapper ref={ref}></ResizeBarWrapper>;
};

const MainView = ({ file, active }) => {
  const viewRef = useRef();
  const editorVisible = file.editorVisible;
  const [height, setHeight] = useState(300);
  return (
    <MainViewStyle ref={viewRef} style={{ display: active ? "flex" : "none" }}>
      {file.mode === "nodes" ? (
        <NodeView nodes={file.nodes} />
      ) : (
        <HexView
          height={height}
          editorVisible={editorVisible}
          active={active}
          id={file.id}
        />
      )}
      {editorVisible ? (
        <ResizeBar
          viewRef={viewRef}
          onResize={(delta) => {
            if (delta < 50) {
              DataState.toggle_editor_visible();
              setHeight(100);
              return;
            }
            setHeight(delta);
          }}
          visible={editorVisible}
        />
      ) : null}
      <div
        style={{
          width: "100%",
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
          display: editorVisible ? "block" : "none",
        }}
      >
        <Editor
          data={file}
          onUpdate={(str) => DataState.update_model(file, str)}
        />
      </div>
    </MainViewStyle>
  );
};
const AppContainer = () => {
  const ref = useRef();
  const activeFile = useDataState("activeFile");
  const files = useDataState("files");

  useEffect(() => {
    if (ref.current) {
      ref.current.ondragover = () => {
        return false;
      };
      ref.current.ondragleave = () => {
        return false;
      };
      ref.current.ondragend = () => {
        return false;
      };
      const listener = (event) => {
        event.preventDefault();
        DataState.register_files(event.dataTransfer.files);
      };
      ref.current.addEventListener("drop", listener);
      return () => {
        ref.current.removeEventListener("drop", listener);
      };
    }
  }, [ref.current]);

  return (
    <WrapperStyle>
      <div className={"main-content"} ref={ref}>
        {Object.keys(files).length === 0 ? (
          <EmptyContainerStyle>
            <h2>Drag and drop files to inspect them</h2>
          </EmptyContainerStyle>
        ) : (
          Object.values(files).map((e) => (
            <MainView key={e.id} active={e === activeFile} file={e} />
          ))
        )}
      </div>
    </WrapperStyle>
  );
};
export default AppContainer;
