import { Button, Slider, Stack, TextField, Typography } from "@mui/material";
import { HashtagType } from "data/hashtag";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
    addNewHashtag: (hashtag: HashtagType) => void;
};

function AddHashtag({ addNewHashtag }: Props) {
    const [newHashtag, setNewHashtag] = useState("");
    const [numberOfTweets, setNumberOfTweets] = useState<number>(100);

    const handleChange = (event: Event, newValue: number | number[]) => {
        setNumberOfTweets(newValue as number);
    };

    const handleAddButton = () => {
        addNewHashtag({
            id: uuidv4(),
            color: "#000000",
            title: newHashtag,
            tweets: [],
        });
        setNewHashtag("");
    };

    return (
        <Stack>
            <TextField
                label="Dodaj nowy hashtag"
                variant="outlined"
                sx={{ my: 1 }}
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                fullWidth
            />
            <Typography variant="h6" color="primary">
                Liczba twettów
            </Typography>
            <Slider
                marks
                min={25}
                step={25}
                max={1000}
                aria-label="Default"
                valueLabelDisplay="auto"
                value={numberOfTweets}
                onChange={handleChange}
            />
            <Button
                variant="outlined"
                sx={{ mt: 0.5, mb: 1 }}
                fullWidth
                onClick={handleAddButton}
                disabled={newHashtag.length < 3}
            >
                Dodaj
            </Button>
        </Stack>
    );
}

export default AddHashtag;
