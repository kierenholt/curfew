import { Box } from '@mui/material';
import './App.css';
import { RedirectCheck } from './RedirectCheck';

function App() {

    return (
        <Box  sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px",  margin: "auto" }}>
            <RedirectCheck />
        </Box>

    )
}

export default App;
