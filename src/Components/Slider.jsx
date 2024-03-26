import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider, { SliderThumb } from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';

const Input = styled(MuiInput)({
  width: 50,
  '& input': {
    color: 'white', // Uniswap ljubičasta za tekst unutar inputa
  },
  // Uklonite stilove za '.Mui-focused' ako ste ih ranije dodali za outline
  '&:hover:not(.Mui-disabled):before': {
    borderBottom: '2px solid #ff007a', // Uniswap ljubičasta za donju liniju na hover, ako nije disabled
  },
  '&.MuiInput-underline:before': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.42)', // Defaultna boja za donju liniju kada nije fokusirano
  },
  '&.MuiInput-underline:after': {
    borderBottom: '2px solid #ff007a', // Uniswap ljubičasta za donju liniju kada je fokusirano
  },
  '&.MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottom: '2px solid #ff007a', // Jača linija na hover pre fokusa
  },
});



// Prilagođavanje izgleda Thumb komponente slajdera
const UniswapSliderThumb = styled(SliderThumb)({
  '&:before': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Dodavanje blage senke za dodatni vizuelni efekat
  },
  backgroundColor: '#ff007a', // Uniswap ljubičasta za thumb
  '&:hover, &.Mui-focusVisible': {
    boxShadow: `0px 0px 0px 8px rgba(255, 0, 122, 0.16)`, // Svetlija senka oko thumb-a prilikom hover-a ili fokusa
  },
});

export default function InputSlider(props) {
  const [value, setValue] = React.useState(30);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    props.onSliderChange(newValue); // Poziva callback funkciju sa novom vrednošću
  };

  const handleInputChange = (event) => {
    let newValue = event.target.value === '' ? '' : Number(event.target.value);
    newValue = !isNaN(newValue) ? newValue : 0; // Ako nije broj, postavi na 0
    newValue = Math.min(Math.max(newValue, 0), 10000); // Ograničava vrednosti unutar dozvoljenog opsega
    setValue(newValue);
    if (props.onSliderChange) {
      props.onSliderChange(newValue); // Prosleđuje novu vrednost roditeljskoj komponenti
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography id="input-slider" gutterBottom>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <AccessTimeIcon sx={{ color: '#AAA' }} /> {/* Sivkasta ikonica za vreme */}
        </Grid>
        <Grid item xs>
          <Slider
            value={value > 100 ? 100 : typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={100}
            components={{ Thumb: UniswapSliderThumb }} // Primena prilagođenog Thumb-a
            sx={{
              '& .MuiSlider-track': { backgroundColor: '#ff007a' }, // Uniswap ljubičasta za track
              '& .MuiSlider-rail': { backgroundColor: '#CCC' }, // Sivkasta boja za rail
            }}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            margin="dense"
            onChange={handleInputChange}
            onBlur={() => {}}
            inputProps={{
              step: 1,
              min: 0,
              type: 'text', // Koristi 'text' da omogući unos bilo koje vrednosti
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
