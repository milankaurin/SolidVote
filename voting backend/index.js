const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const { factoryAddress, factoryAbi } = require('../src/Constant/constant');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(require('helmet')());
app.use(require('morgan')('combined'));

const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/vote/:id', apiLimiter);

app.post('/vote/:id', async (req, res) => {
    const { id } = req.params;

    // Hard-coded URL for testing
    const TEST_ETHEREUM_NODE_URL = 'https://eth-sepolia.g.alchemy.com/v2/csR_c3IEfR3XoFwg-yizkB1G3gBlUySt';

    try {
        const provider = new ethers.providers.JsonRpcProvider(TEST_ETHEREUM_NODE_URL);
        const contract = new ethers.Contract(factoryAddress, factoryAbi, provider);
        const voterInstanceAddress = await contract.getVotingInstanceForVoter(id);

        if (voterInstanceAddress === ethers.constants.AddressZero) {
            console.log("Invalid voting session ID");
            return res.status(404).json({ error: 'Invalid voting session ID' });
        }

        res.json({ voterInstanceAddress });
    } catch (error) {
        console.error('Error fetching voter instance:', error);
        res.status(500).json({ error: 'Failed to fetch voter instance' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, '127.0.0.1', () => {
    console.log(`Server running on port ${port}`);
});
