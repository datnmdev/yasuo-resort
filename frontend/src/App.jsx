import { RouterProvider } from "react-router";
import "./App.css";
import router from "./routers";
import { Provider } from "react-redux";
import { store } from "./stores";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
