import { useState, useEffect } from "react";

function useFetch(callApiFunc, options = {}, auto = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState({
    value: false,
  });

  useEffect(() => {
    async function callApi() {
      setData(null);
      setError(null);
      setLoading(true);
      try {
        const response = await callApiFunc(options);
        setData(await response.data);
      } catch (err) {
        setData(err.response.data);
        setError(err.response.data.error);
      } finally {
        setLoading(false);
      }
    }

    if (auto || refetch.value) {
      callApi();
    }
  }, [auto, refetch]);

  return { data, error, isLoading, setRefetch };
}

export default useFetch;
