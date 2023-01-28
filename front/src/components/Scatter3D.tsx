import React, { useEffect, useState, useLayoutEffect } from "react";
import 'echarts-gl/dist/echarts-gl';
import ReactECharts from "echarts-for-react";
import { HashtagType } from "data/hashtag";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

type Props = {
    hashtags: HashtagType[];
    // refresh: boolean;
    // setRefresh: (dim: any) => void;
};

export default function Scatter3D({ hashtags }: Props) {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [hashtagsLocal, sethashtagsLocal] = useState([]);
    var eChatrsOptionsInit : any = {};
    var series = [];
    const [eChatrsOptions, setEChatrsOptions] = useState(eChatrsOptionsInit);

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        series = [];
        var tweets = [];
        for (const hashtag of hashtags) {
            tweets = [];
            for (const tweet of hashtag.tweets) {
                tweets.push([
                    tweet['x'],
                    tweet['y'],
                    tweet['z'],
                    tweet['tweet'],
                ])
            }
            series.push({
                name: hashtag.title,
                type: 'scatter3D',
                symbolSize: 16,
                data: [...tweets],
                itemStyle: { opacity: 1 },
                color: hashtag.color,
                markPoint: {
                    label: {
                        show: false,
                        fontSize: 0,
                    }
                },
                label: {
                    fontSize: 0,
                }
            });
        }
        sethashtagsLocal(series);
    }, [hashtags]);

    useEffect(() => {
        setEChatrsOptions(
            {
                tooltip: {
                    formatter: (params) => {
                        return `<div style="max-width: 350px; word-wrap: break-word;
                        overflow-wrap: break-word; ">
                        ${params.marker}${params.seriesName}<br />
                        <textarea id="textContentOutput" 
                        rows="6" cols="40" style="font-family: inherit;
                        font-size: inherit; border:solid 0px orange;" readonly>${params.value[3]}</textarea><br />
                        </div>
                        `;
                    },
                },
                legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center',
                    textStyle: {
                        color: '#ccc'
                    }
                },
                grid3D: {
                    boxWidth: 130,
                    boxHeight: 130,
                    boxDepth: 130,
                    axisLine: {
                        lineStyle: {
                            color: '#505050',
                            width: 1,
                            opacity: 1,
                        }
                    },
                        axisPointer: {
                            lineStyle: {
                            color: '#ffbd67',
                        }
                    },
                        viewControl: {
                        // autoRotate: true,
                        // projection: 'orthographic'
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#ffffff',
                            fontSize: 16,
                        }
                    }
                },
                xAxis3D: {
                    name: 'PC1',
                    type: 'value',
                },
                yAxis3D: {
                    name: 'PC2',
                    type: 'value',
                },
                zAxis3D: {
                    name: 'PC3',
                    type: 'value',
                },
                series: hashtagsLocal,
                itemStyle: {
                    borderWidth: 0.5,
                    borderColor: 'rgba(255,255,255,1)'
                },
                emphasis: {
                    label: {
                        fontSize: 0,
                    }
                }
            }
        
        );
    }, [hashtagsLocal]);


    return (
        
        <div>
            {eChatrsOptions && <ReactECharts
                option={eChatrsOptions} style={{display: "flex", height: windowDimensions.height, background: "#000000"}}
            />}
        </div>
    );
}
