import BubbleChart from "components/BubbleChart";
import { Button, Fab } from "@mui/material/";
import Menu from "components/Menu";
import Scatter3D from "components/Scatter3D";
import { HashtagType } from "data/hashtag";
import { darkTheme } from "main";
import React, { useEffect, useState, useRef, Component } from "react";
import { Toaster } from "react-hot-toast";

function App() {
    const [hashtags, setHashtags] = useState<HashtagType[]>([]);
    // const [hashtags3D, setHashtags3D] = useState<HashtagType[]>([]);
    const [dimensions, setDimensions] = useState(3);
    const [refresh, setRefresh] = useState(false);

    const switchDim = () => {
        setDimensions(dimensions == 2 ? 3 : 2);
    }

    useEffect(() => {
        fetch("notWhitenPCA3D.json")
            .then((response) => response.json())
            .then((data) => {
                setHashtags(data);
            });
        // fetch("whitenPCA3DNormalized.json")
        //     .then((response) => response.json())
        //     .then((data) => {
        //         setHashtags3D(data);
        //     });
    }, []);

    class ChartContener extends Component {
        render() {
          return React.createElement("div", {id: 'chart3d'} );
        }
      }

    return (
        <div>
            <Fab 
                color="primary"
                aria-label="add"
                variant="extended"
                onClick={switchDim}
                sx={{
                    position: "absolute",
                    top: "3%",
                    left: "5%",
                    // transform: "translateY(-50%)",
                }}
            >
                <span style={{ fontWeight: 'bold' }}>Switch to {dimensions == 2 ? 3 : 2} D</span>
            </Fab>
            <Menu hashtags={hashtags} setHashtags={setHashtags} dimensions={dimensions} setDimensions={setDimensions}/>
            {dimensions == 2 && <BubbleChart hashtags={hashtags} />}
            {dimensions == 3 && <Scatter3D hashtags={hashtags}/> }
            
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
        </div>
    );
}
export default App;
