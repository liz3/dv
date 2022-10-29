import React, { useRef, useEffect } from "react";
import { styled } from "goober";
import DataState from "../common/DataState.mjs";
const Wrapper = styled("div", React.forwardRef)`
  position: relative;
  height: 100%;
  width: 15px;
  border-left: 1px solid #333232;
  max-width: 13px;
  & > div {
    position: relative;
    height: calc(100% - ${({ $height }) => $height}%);
    width: 13px;
  }
`;
const Bar = styled("div", React.forwardRef)`
  background: #4e4e4e;
  position: absolute;
  left: 0;
  top: 0;
  height: ${({ $height }) => $height}%;
  width: 100%;
`;
const Scrollbar = ({ max, visible, onChange }) => {
  const bar_height = (visible / max < 0.05 ? 0.05 : visible / max) * 100;
  const ref = useRef();
  const viewRef = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const listener = (value) => {
      const offset = value / max > 0.5 ? (value + visible) / max : value / max;
      ref.current.style.top = `${offset * 100}%`;
    };
    DataState.register("scrollValue", listener);
    return () => {
      DataState.unregister("scrollValue", listener);
    };
  }, [visible, ref, max]);
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
            const target = Math.floor(max * ((ev.clientY - 30) / rect.height));
            console.log(target, max);
            DataState.emit("setScroll", target);
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
  }, [ref, viewRef, max]);
  return (
    <Wrapper ref={viewRef} $height={bar_height}>
      <div>
        <Bar ref={ref} $height={bar_height} />
      </div>
    </Wrapper>
  );
};
export default Scrollbar;
