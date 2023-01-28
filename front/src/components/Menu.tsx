import NavigateNext from "@mui/icons-material/NavigateNext";
import { Box, Fab, Stack, Typography, Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { HashtagType } from "data/hashtag";
import { useState } from "react";
import TransferList from "./TransferList";
import RowRadioButtonsGroup from "./RowRadioButtonsGroup";

type Props = {
    hashtags: HashtagType[];
    setHashtags: (hashtags: HashtagType[]) => void;
    dimensions: number;
    setDimensions: (dim: any) => void;
};

export default function SideBar({ hashtags, setHashtags, dimensions, setDimensions }: Props) {
    const [open, setOpen] = useState(false);
    const [pca, setPca] = useState("Standard PCA");
    const [norm, setNorm] = useState("Not normalized");

    const pcaOptions = ["Standard PCA", "Whiten PCA"]
    const outputOptions = ["Not normalized", "Normalized"]

    function getPcaOption() {
        return pcaOptions.indexOf(pca);
    }

    function getNormOption() {
        return outputOptions.indexOf(norm);
    }

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
                        <RowRadioButtonsGroup title={"PCA version"} options={pcaOptions} setOption={setPca} />
                        <RowRadioButtonsGroup title={"Norm output"} options={outputOptions} setOption={setNorm} />
                        <TransferList
                            hashtags={hashtags}
                            setHashtags={setHashtags}
                            pca={getPcaOption}
                            norm={getNormOption}
                            dimensions={dimensions}
                            setDimensions={setDimensions}
                        />
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
