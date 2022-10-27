import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { styled } from "goober";
import DataState from "../common/DataState.mjs";

const HexViewStyle = styled("div", React.forwardRef)`
  width: 100%;
  flex-grow: 1;
  overflow-y: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 30px));
  & span {
    padding: 2px;

    color: #cfcfcf;
    text-align: center;
    min-height: 26px;
  }
`;

const HexView = ({ id, active, height, editorVisible }) => {
  const ref = useRef();

  const valueRef = useRef(0);
  const [bounds, setBounds] = useState(null);
  const [bytes, setBytes] = useState(null);
  const totalRows = bytes
    ? Math.floor(bytes.length / bounds?.rectBounds.columns || 1)
    : 0;
  useEffect(() => {
    DataState.get_file_content(id).then((content) => setBytes(content));
  }, [id]);
  const computeBounds = () => {
    const rect = ref.current.getBoundingClientRect();
    const columns = Math.floor(rect.width / 30);
    const rows = Math.floor(rect.height / 26);
    return { columns, rows };
  };
  const getElements = useCallback(() => {
    const rectBounds = computeBounds();
    ref.current.innerHTML = "";
    const len = rectBounds.columns * rectBounds.rows;
    const list = [];
    for (let i = 0; i < len; i++) {
      const el = window.document.createElement("span");
      ref.current.appendChild(el);
      list.push(el);
    }
    return { rectBounds, list };
  }, [ref]);
  useLayoutEffect(() => {
    setBounds(getElements());
  }, [height, editorVisible]);
  useEffect(() => {
    if (!ref.current || !bytes) return;

    setBounds(getElements());
    const listener = (ev) => {
      setBounds(getElements());
    };
    window.addEventListener("resize", listener);
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [ref.current, active, bytes]);
  useLayoutEffect(() => {
    if (!ref.current || !bounds || !bytes) return;
    const render = () => {
      const tRows = Math.floor(bytes.length / bounds.rectBounds.columns);
      if (tRows < bounds.rectBounds.rows) valueRef.current = 0;
      else if (valueRef.current > tRows - bounds.rectBounds.rows + 2)
        valueRef.current = tRows - bounds.rectBounds.rows - 1;
      const skip = bounds.rectBounds.columns * valueRef.current;
      for (
        let i = 0;
        i < bounds.rectBounds.columns * bounds.rectBounds.rows;
        i++
      ) {
        const index = skip + i;
        if (index >= bytes.length) {
          bounds.list[i].innerText = "";
          continue;
        }
        if (i >= bounds.list.length) {
          throw new Error("bruh");
        }
        bounds.list[i].innerText = `${bytes[index].toString(16)}`;
      }
    };
    const listener = (ev) => {
      valueRef.current += ev.deltaY > 0 ? 1 : -1;
      if (valueRef.current < 0) valueRef.current = 0;
      if (valueRef.current > totalRows + 2 - bounds.rectBounds.rows) {
        valueRef.current = totalRows + 2 - bounds.rectBounds.rows;
      }

      render();
    };
    render();
    ref.current.addEventListener("wheel", listener, {
      passive: true,
    });
    return () => {
      ref.current.removeEventListener("wheel", listener);
    };
  }, [ref.current, bounds, bytes]);
  return <HexViewStyle ref={ref} />;
};
export default HexView;
