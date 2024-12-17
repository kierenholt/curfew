import './App.css';
import { Box } from '@mui/material';
import { PinContainer } from './pin/pinContainer';
import { PageSelector } from './pageSelector/pageSelector';
import { ProgressModalContainer } from './progress/progressModalContainer';

function App() {
    return (
        <Box sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px", margin: "auto" }}>
            <PinContainer >
                <ProgressModalContainer>
                    <PageSelector />
                </ProgressModalContainer>
            </PinContainer>
        </Box>
    )
}

export default App;