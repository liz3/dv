import React from "react";
import AppContainer from "./components/AppContainer.jsx";
import { setup } from "goober";
setup(React.createElement);
function App() {
  return <AppContainer />;
}
export default App;
