import { Box } from '@mui/material';
import './App.css';
import { DetectUser } from './managementPages/DetectUser';

function App() {

    return (
        <Box  sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px",  margin: "auto" }}>
            <DetectUser />
        </Box>

    )
}

export default App;
