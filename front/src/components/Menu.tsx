import NavigateNext from "@mui/icons-material/NavigateNext";
import {
    Box,
    Button,
    Fab,
    List,
    ListItem,
    Slider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { HashtagType } from "data/hashtag";
import { useState } from "react";
import { getFetch } from "utils/fetches";

type Props = {
    hashtags: HashtagType[];
    setHashtags: (hashtags: HashtagType[]) => void;
    activeHashtags: string[];
    setActiveHashtags: (activeHashtags: string[]) => void;
};

export default function SideBar({
    hashtags,
    setHashtags,
    activeHashtags,
    setActiveHashtags,
}: Props) {
    const [open, setOpen] = useState(true);
    const [newHashtag, setNewHashtag] = useState("");
    const [numberOfTweets, setNumberOfTweets] = useState<number>(100);

    const handleChange = (event: Event, newValue: number | number[]) => {
        setNumberOfTweets(newValue as number);
    };

    const handleToggle = (value: string) => () => {
        const currentIndex = activeHashtags.indexOf(value);
        const newChecked = [...activeHashtags];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setActiveHashtags(newChecked);
    };

    const generateHashtags = () => {
        return hashtags.map((value) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
                <ListItem key={value.id} disablePadding>
                    <ListItemButton role={undefined} onClick={handleToggle(value.id)} dense>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={activeHashtags.indexOf(value.id) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ "aria-labelledby": labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={value.title} />
                    </ListItemButton>
                </ListItem>
            );
        });
    };

    const addHashtag = () => {
        console.log(numberOfTweets);
        getFetch<HashtagType>(
            `/twitts?hashtag=${newHashtag}&limit=${numberOfTweets}&components=2`
        ).then((hashtag) => {
            console.log(hashtag);
            hashtag.title = hashtag.title + " " + hashtag.tweets.length;
            setHashtags([...hashtags, hashtag]);
            setActiveHashtags([hashtag.id]);
        });
    };

    return (
        <>
            <Fab
                size="small"
                color="primary"
                aria-label="add"
                onClick={() => setOpen(true)}
                sx={{
                    position: "absolute",
                    top: "49%",
                    left: 0,
                    transform: "translateY(-50%)",
                }}
            >
                <NavigateNext />
            </Fab>
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <Box width="300px">
                    <Stack alignItems="center" py={2} px={4}>
                        <Typography variant="h2" color="primary">
                            Menu
                        </Typography>
                        <TextField
                            label="Hashtag"
                            variant="outlined"
                            sx={{ my: 2 }}
                            value={newHashtag}
                            onChange={(e) => setNewHashtag(e.target.value)}
                            fullWidth
                        />
                        <Typography variant="h6" color="primary">
                            Liczba postów
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
                            sx={{ mt: 0.5 }}
                            fullWidth
                            onClick={addHashtag}
                            disabled={newHashtag.length < 3}
                        >
                            Dodaj
                        </Button>

                        <Typography variant="h4" color="primary" mt={2}>
                            Hashtags
                        </Typography>
                        <List
                            sx={{
                                mt: 2,
                                width: "100%",
                                maxWidth: 360,
                                bgcolor: "background.paper",
                            }}
                        >
                            {hashtags ? generateHashtags() : "Brak hashtagów"}
                        </List>
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
