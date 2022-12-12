import NavigateNext from "@mui/icons-material/NavigateNext";
import { Box, Fab, Stack, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { HashtagType } from "data/hashtag";
import { useState } from "react";
import TransferList from "./TransferList";

type Props = {
    hashtags: HashtagType[];
    setHashtags: (hashtags: HashtagType[]) => void;
};

export default function SideBar({ hashtags, setHashtags }: Props) {
    const [open, setOpen] = useState(false);

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
                    <Stack alignItems="center" py={2}>
                        <Typography variant="h2" color="primary">
                            Menu
                        </Typography>

                        <TransferList hashtags={hashtags} setHashtags={setHashtags} />
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
