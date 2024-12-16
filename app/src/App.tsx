import './App.css';
import { Box } from '@mui/material';
import { PinContainer } from './pin/pinContainer';
import { PageSelector } from './pageSelector/pageSelector';

function App() {
    return (
        <Box sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px", margin: "auto" }}>
            <PinContainer >
                <PageSelector />
            </PinContainer>
        </Box>
    )
}

export default App;