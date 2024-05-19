import { Box } from '@mui/material';
import './App.css';
import { PageContextWrapper } from './PageContext';

function App() {
    return (
        <Box  sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px",  margin: "auto" }}>
            <PageContextWrapper/>
        </Box>

    )
}

export default App;
