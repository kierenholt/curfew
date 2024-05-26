import { Box } from '@mui/material';
import './App.css';
import { PageContent } from './managementPages/PageContent';

function App() {

    return (
        <Box  sx={{ p: 2, border: '1px dashed grey', maxWidth: "800px",  margin: "auto" }}>
            <PageContent />
        </Box>

    )
}

export default App;
