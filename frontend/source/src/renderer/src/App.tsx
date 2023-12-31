import "./App.css";

import { ConfigProvider } from "./contexts/ConfigContext";
import { DataProvider } from "./contexts/DataContext";
import Home from "./views/Home";

function App(): JSX.Element {
  return (
    <div className="App">
      <ConfigProvider>
        <DataProvider>
          <Home />
        </DataProvider>
      </ConfigProvider>
    </div>
  );
}

export default App;
