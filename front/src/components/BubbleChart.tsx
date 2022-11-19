import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_dark from "@amcharts/amcharts5/themes/Dark";
import * as am5xy from "@amcharts/amcharts5/xy";
import { HashtagType } from "data/hashtag";
import { useLayoutEffect } from "react";

type Props = {
    hashtags: HashtagType[];
    activeHashtags: string[];
};

function pickTextColorBasedOnBgColorSimple(bgColor, lightColor, darkColor) {
    var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}

function BubbleChart({ hashtags, activeHashtags }: Props) {
    let activeHashtagsData = [] as HashtagType[];
    if (hashtags) {
        activeHashtagsData = hashtags.filter((hashtag) => {
            return activeHashtags.indexOf(hashtag.id) !== -1;
        });
    }

    useLayoutEffect(() => {
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        const root = am5.Root.new("chartdiv");
        // root.fps = 60;root.fps = 30;

        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([am5themes_Animated.new(root), am5themes_dark.new(root)]);

        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        let chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelY: "zoomXY",
                pinchZoomX: true,
                pinchZoomY: true,
                maxTooltipDistance: -1,
                // cursor: am5xy.XYCursor.new(root, {}),
            })
        );

        let legend = chart.children.push(
            am5.Legend.new(root, {
                y: am5.percent(85),
                x: am5.percent(90),
                centerY: am5.percent(50),
                centerX: am5.percent(50),
                layout: am5.GridLayout.new(root, {
                    maxColumns: 2,
                    fixedWidthGrid: true,
                }),
            })
        );
        legend.labels.template.setAll({
            fontSize: 20,
            fontWeight: "500",
        });

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        let xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -1.1,
                max: 1.1,
                renderer: am5xy.AxisRendererX.new(root, {
                    minGridDistance: 50,
                }),
            })
        );
        let yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -1.1,
                max: 1.1,
                renderer: am5xy.AxisRendererY.new(root, {}),
            })
        );

        chart.set(
            "cursor",
            am5xy.XYCursor.new(root, {
                xAxis: xAxis,
                yAxis: yAxis,
            })
        );
        let cursor = chart.get("cursor");
        cursor.lineX.setAll({
            visible: false,
        });
        cursor.lineY.setAll({
            visible: false,
        });

        for (const hashtag of activeHashtagsData) {
            // console.log(hashtag.tweets[0].clasiffication.);
            // console.log(hashtag.tweets[0].clasiffication[1]);

            const textColor = pickTextColorBasedOnBgColorSimple(
                hashtag.color,
                "#ffffff",
                "#000000"
            );

            // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
            let series = chart.series.push(
                am5xy.LineSeries.new(root, {
                    calculateAggregates: true,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueXField: "x",
                    valueYField: "y",
                    fill: am5.color(hashtag.color),
                    tooltip: am5.Tooltip.new(root, {
                        labelText: `Hashtag - ${hashtag.title}\nTwitt:\n{text}`,
                        labelHTML: `<p style="color:${textColor};">Hashtag - ${hashtag.title}<br/>
                        Twitt:\n<p style="max-width: 500px;color:${textColor};">{twitt}<p/></p>`,
                    }),
                    legendLabelText: `${hashtag.title}`,
                })
            );

            // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Bullets
            series.bullets.push(function () {
                let graphics = am5.Circle.new(root, {
                    radius: 6,
                    fill: series.get("fill"),
                });
                return am5.Bullet.new(root, {
                    sprite: graphics,
                });
            });

            series.data.setAll(hashtag.tweets);
        }

        legend.data.setAll(chart.series.values);
        return () => {
            root.dispose();
        };
    }, [activeHashtagsData]);

    return (
        <div id="chartdiv" style={{ width: "100vw", height: "100vh", background: "black" }}></div>
    );
}

export default BubbleChart;
