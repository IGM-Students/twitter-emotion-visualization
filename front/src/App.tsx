import BubbleChart from "components/BubbleChart";
import Menu from "components/Menu";
import { HASHTAGS_DATA, HashtagType } from "data/hashtag";
import { useState } from "react";

function App() {
    const [hashtags, setHashtags] = useState<HashtagType[]>(HASHTAGS_DATA);
    const [activeHashtags, setActiveHashtags] = useState(() => {
        return hashtags.map((hashtag) => {
            return hashtag.id;
        });
    });

    return (
        <>
            <Menu
                hashtags={hashtags}
                activeHashtags={activeHashtags}
                setActiveHashtags={setActiveHashtags}
            />
            <BubbleChart hashtags={hashtags} activeHashtags={activeHashtags} />
        </>
    );
}
export default App;
