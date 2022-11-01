import NavigateNext from "@mui/icons-material/NavigateNext";
import { Box, Button, Fab, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { HashtagType } from "data/hashtag";
import { useState } from "react";

type Props = {
    hashtags: HashtagType[];
    activeHashtags: string[];
    setActiveHashtags: (activeHashtags: string[]) => void;
};

export default function SideBar({ hashtags, activeHashtags, setActiveHashtags }: Props) {
    const [open, setOpen] = useState(true);
    const [newHashtag, setNewHashtag] = useState("");

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
                        <ListItemText id={labelId} primary={value.text} />
                    </ListItemButton>
                </ListItem>
            );
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
                            sx={{ mt: 2 }}
                            value={newHashtag}
                            onChange={(e) => setNewHashtag(e.target.value)}
                            fullWidth
                        />
                        <Button variant="outlined" sx={{ mt: 0.5 }} fullWidth>
                            Dodaj
                        </Button>

                        <Typography variant="h3" color="primary" mt={2}>
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
                            {generateHashtags()}
                        </List>
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
