import React,{ useState, useContext, createContext } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import Box from "@mui/material/Box";

const LoaderContext = createContext()
export default function LoaderProvider({children}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('')
  const closeLoader = () => {
    setOpen(false);
  };
  const openLoader = (message='Loading...') => {
    setMessage(message)
    setOpen(true);
  };
  
  return (
      <LoaderContext.Provider value={{closeLoader,openLoader}}>
        {children}
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1, flexDirection: "column" })}
        open={open}
      >
        <CircularProgress color="inherit" />
        <Box mt={2}>
            <Typography variant="h6">{message}</Typography>
          </Box>
      </Backdrop>
    </LoaderContext.Provider>
  )
  
}
export const useLoader = ()=>useContext(LoaderContext)
