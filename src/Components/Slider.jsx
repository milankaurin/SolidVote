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
    color: 'white', 
  },

  '&:hover:not(.Mui-disabled):before': {
    borderBottom: '2px solid #ff007a', 
  },
  '&.MuiInput-underline:before': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.42)', 
  },
  '&.MuiInput-underline:after': {
    borderBottom: '2px solid #ff007a', 
  },
  '&.MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottom: '2px solid #ff007a', 
  },
});




const UniswapSliderThumb = styled(SliderThumb)({
  '&:before': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)', 
  },
  backgroundColor: '#ff007a', 
  '&:hover, &.Mui-focusVisible': {
    boxShadow: `0px 0px 0px 8px rgba(255, 0, 122, 0.16)`, 
  },
});

export default function InputSlider(props) {
  const [value, setValue] = React.useState(30);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    props.onSliderChange(newValue); 
  };

  const handleInputChange = (event) => {
    let newValue = event.target.value === '' ? '' : Number(event.target.value);
    newValue = !isNaN(newValue) ? newValue : 0;
    newValue = Math.min(Math.max(newValue, 0), 10000); 
    setValue(newValue);
    if (props.onSliderChange) {
      props.onSliderChange(newValue); 
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography id="input-slider" gutterBottom>
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <AccessTimeIcon sx={{ color: '#AAA' }} /> 
        </Grid>
        <Grid item xs>
          <Slider
            value={value > 100 ? 100 : typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={100}
            components={{ Thumb: UniswapSliderThumb }} 
            sx={{
              '& .MuiSlider-track': { backgroundColor: '#ff007a' }, 
              '& .MuiSlider-rail': { backgroundColor: '#CCC' },
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
              type: 'text', 
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
