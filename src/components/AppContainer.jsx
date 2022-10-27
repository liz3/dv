import React, { useMemo, useState } from "react";
import useDataState from "../common/useDataState.mjs";
import { styled } from "goober";
import TabView from "./TabView.jsx";
import BottomView from "./BottomLine.jsx";
import MainView from "./MainView.jsx";

const WrapperStyle = styled("div")`
  width: 100%;
  height: 100%;
  background: #1a1919;
  display: flex;
  flex-direction: column;
`;
const AppContainer = () => {
  return (
    <WrapperStyle>
      <TabView />
      <MainView />
      <BottomView />
    </WrapperStyle>
  );
};
export default AppContainer;
