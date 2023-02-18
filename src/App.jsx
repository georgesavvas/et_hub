import React from "react";

import "react-reflex/styles.css";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import darkScrollbar from "@mui/material/darkScrollbar";
import GlobalStyles from "@mui/material/GlobalStyles";
import {SnackbarProvider} from "notistack";
import {ErrorBoundary} from "react-error-boundary";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import "./App.css";
import {ConfigProvider} from "./contexts/ConfigContext";
import Home from "./views/Home";


let darkTheme = createTheme({
  palette: {
    mode: "dark",
    ethub: {
      main: "rgb(252, 140, 3)",
    },
    lightgrey: {
      main: "rgb(211,211,211)",
    },
  },
  typography: {
    fontSize: 12.5,
    allVariants: {
      color: "lightgrey"
    }
  },
});

const ErrorFallback = ({error, resetErrorBoundary}) => {
  return (
    <div className="errorFallback" role="alert">
      {/* <ErrorIcon /> */}
      <Typography variant="h4">{"Hub has crashed :("}</Typography>
      <Button color="ethub" variant="outlined" size="large" onClick={resetErrorBoundary}>Reload</Button>
      <pre className="errorContainer">{error.message}</pre>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles styles={{...darkScrollbar()}} />
      <div className="App">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
            <ConfigProvider>
              <Home />
            </ConfigProvider>
          </SnackbarProvider>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
