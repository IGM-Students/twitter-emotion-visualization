import { Button, Stack, TextField } from "@mui/material";
import { HashtagType } from "data/hashtag";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = {
    addNewHashtag: (hashtag: HashtagType) => void;
};

function AddHashtag({ addNewHashtag }: Props) {
    const [newHashtag, setNewHashtag] = useState("");

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
