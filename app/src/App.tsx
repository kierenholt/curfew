import './App.css';
import { Box } from '@mui/material';
import { PasswordContainer } from './password/password';

function App() {

    return (
        <Box sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px", margin: "auto" }}>
            <PasswordContainer />
        </Box>
    )
}

export default App;