import "./App.css";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import router from "./routes/Router";

import store from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      {/* <ToastContainer /> */}
    </Provider>
  );
}

export default App;
