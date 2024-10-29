import { useState } from 'react';
import { userContext } from './context';

export const UserProvider = ({ children }) => {
  const [data, setData] = useState(null);

  return (
    <userContext.Provider value={{ data, setData }}>
      {children}
    </userContext.Provider>
  );
};
