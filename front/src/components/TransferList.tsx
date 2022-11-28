import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { HashtagType } from "data/hashtag";
import * as React from "react";
import { getFetch } from "utils/fetches";
import AddHashtag from "./AddHashtag";

type Props = {
    hashtags: HashtagType[];
    setHashtags: (hashtags: HashtagType[]) => void;
};

function not(a: readonly HashtagType[], b: readonly HashtagType[]) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly HashtagType[], b: readonly HashtagType[]) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export default function TransferList({ hashtags, setHashtags }: Props) {
    const [checked, setChecked] = React.useState<readonly HashtagType[]>([]);
    const [up, setUp] = React.useState<readonly HashtagType[]>(hashtags);
    const [down, setDown] = React.useState<readonly HashtagType[]>([]);

    const upChecked = intersection(checked, up);
    const downChecked = intersection(checked, down);

    const handleToggle = (value: HashtagType) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllDown = () => {
        setDown(down.concat(up));
        setUp([]);
    };

    const handleCheckedDown = () => {
        setDown(down.concat(upChecked));
        setUp(not(up, upChecked));
        setChecked(not(checked, upChecked));
    };

    const handleCheckedUp = () => {
        setUp(up.concat(downChecked));
        setDown(not(down, downChecked));
        setChecked(not(checked, downChecked));
    };

    const handleAllUp = () => {
        setUp(up.concat(down));
        setDown([]);
    };

    const addNewHashtag = (newHashtag: HashtagType) => {
        setDown(down.concat(newHashtag));
    };

    const newChart = () => {
        console.log(down);

        // getFetch<HashtagType[]>(
        //     `/twitts?hashtag=${newHashtag}&limit=${numberOfTweets}&components=2`
        // ).then((hashtags) => {
        //     // hashtag.title = hashtag.title + " " + hashtag.tweets.length;
        //     setHashtags(hashtags);
        // });
    };

    const customList = (items: readonly HashtagType[]) => (
        <Paper sx={{ width: 280, height: 200, overflow: "auto" }}>
            <List dense component="div" role="list">
                {items.map((hashtag) => {
                    const labelId = `transfer-list-item-${hashtag.id}-label`;

                    return (
                        <ListItem
                            key={hashtag.id}
                            role="listitem"
                            button
                            onClick={handleToggle(hashtag)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(hashtag) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                        "aria-labelledby": labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                primary={`${hashtag.title} ${hashtag.tweets.length}`}
                            />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Paper>
    );

    return (
        <Grid container gap={1} justifyContent="center" alignItems="center">
            <Grid item>{customList(up)}</Grid>
            <Grid item>
                <Grid container alignItems="center">
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllDown}
                        disabled={up.length === 0}
                        aria-label="move all right"
                    >
                        ⏬
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedDown}
                        disabled={upChecked.length === 0}
                        aria-label="move selected right"
                    >
                        🔽
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleCheckedUp}
                        disabled={downChecked.length === 0}
                        aria-label="move selected left"
                    >
                        🔼
                    </Button>
                    <Button
                        sx={{ my: 0.5 }}
                        variant="outlined"
                        size="small"
                        onClick={handleAllUp}
                        disabled={down.length === 0}
                        aria-label="move all left"
                    >
                        ⏫
                    </Button>
                </Grid>
            </Grid>
            <Grid item>{customList(down)}</Grid>

            <Button
                variant="outlined"
                sx={{ mt: 0.5, mx: 1 }}
                fullWidth
                disabled={down.length < 2}
                onClick={newChart}
            >
                Generuj Nowy wykres
            </Button>

            <AddHashtag addNewHashtag={addNewHashtag} />
        </Grid>
    );
}
