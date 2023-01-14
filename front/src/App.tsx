import BubbleChart from "components/BubbleChart";
import Menu from "components/Menu";
import { HashtagType } from "data/hashtag";
import { darkTheme } from "main";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

function App() {
    const [hashtags, setHashtags] = useState<HashtagType[]>([]);

    useEffect(() => {
        fetch("notWhitenPCA2D.json")//notWhitenPCA2D
            .then((response) => response.json())
            .then((data) => {
                setHashtags(data);
            });
    }, []);

    return (
        <>
            <Menu hashtags={hashtags} setHashtags={setHashtags} />
            <BubbleChart hashtags={hashtags} />
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
