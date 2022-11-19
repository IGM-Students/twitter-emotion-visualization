import BubbleChart from "components/BubbleChart";
import Menu from "components/Menu";
import { HashtagType } from "data/hashtag";
import { darkTheme } from "main";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

function App() {
    const [hashtags, setHashtags] = useState<HashtagType[]>();
    const [activeHashtags, setActiveHashtags] = useState<string[]>([]);

    useEffect(() => {
        fetch("default.json")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setHashtags(data);
            });
    }, []);

    return (
        <>
            <Menu
                hashtags={hashtags}
                setHashtags={setHashtags}
                activeHashtags={activeHashtags}
                setActiveHashtags={setActiveHashtags}
            />
            <BubbleChart hashtags={hashtags} activeHashtags={activeHashtags} />
            <Toaster
                position="bottom-center"
                gutter={10}
                // reverseOrder={true}
                containerStyle={{ marginBottom: "40px" }}
                toastOptions={{
                    style: {
                        background: darkTheme.palette.background.default,
                        color: darkTheme.palette.text.secondary,
                        minWidth: "250px",
                    },
                }}
            />
        </>
    );
}
export default App;
