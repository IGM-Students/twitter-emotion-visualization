import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

type Props = {
    title: string;
    options: string[];
    setOption: (opt: any) => void;
};

export default function RowRadioButtonsGroup({ title, options, setOption }: Props) {
  const [selectedValue, setSelectedValue] = React.useState(options[0]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);

    setOption(event.target.value)
  };

  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{title}</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        
      >
        {  
            options.map((opt) => {
                return <FormControlLabel 
                    value={opt}
                    onChange={handleChange}
                    control={<Radio checked={selectedValue === opt}/>}
                    label={opt}
                />;
            })
        }
      </RadioGroup>
    </FormControl>
  );
}