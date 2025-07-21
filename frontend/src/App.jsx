import { RouterProvider } from 'react-router';
import './App.css';
import router from './routers';
import { Provider } from 'react-redux';
import { store } from './stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
