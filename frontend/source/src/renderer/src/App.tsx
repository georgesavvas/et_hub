import "./App.css";
import "typeface-roboto/index.css";

import { ConfigProvider, theme } from "antd";

import { DataProvider } from "./contexts/DataContext";
import Home from "./views/Home";
import { ConfigProvider as HubConfigProvider } from "./contexts/ConfigContext";

function App(): JSX.Element {
  return (
    <div className="App">
      <ConfigProvider
        theme={{
          algorithm: [
            theme.darkAlgorithm,
            // theme.compactAlgorithm,
          ],
          token: {
            fontFamily: "Roboto",
          },
        }}
      >
        <HubConfigProvider>
          <DataProvider>
            <Home />
          </DataProvider>
        </HubConfigProvider>
      </ConfigProvider>
    </div>
  );
}

export default App;
