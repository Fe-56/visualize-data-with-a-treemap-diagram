import React, { useEffect } from 'react';
import * as d3 from 'd3';

const colors = ["#0ad99f", "#49b246", "#7aa92b", "#8c59ca", "#5366ba", "#f9951d", "#890f3c", "#464204", "#f38842", "#cc811e",
"#13562d", "#a476a2", "#503f3a", "#792fc1", "#5fcd19", "#a936a8", "#37ee07", "#49aaaa", "#bcbfaf", "#a50f2e",
"#0d51ad", "#0ea296", "#0806c5", "#2e562d", "#38732f", "#85dd69", "#e424a4"
];

const TreemapDiagram = (props) => {
    const height = 600;
    const width = 1200;
    var kickstarterDataset;
    var kickstarterDomain;
    var movieDataset;
    var movieDomain;
    var videoGameDataset;
    var videoGameDomain;

    useEffect(() => {
        const main = async() => {
            try{
                const responseKickstarter = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json");
                kickstarterDataset = await responseKickstarter.json();
                kickstarterDomain = [... new Set(kickstarterDataset.children.map(item => item.name))];
                const responseMovie = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json");
                movieDataset = await responseMovie.json();
                movieDomain = [... new Set(movieDataset.children.map(item => item.name))];
                const responseVideoGame = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json");
                videoGameDataset = await responseVideoGame.json();
                videoGameDomain = [... new Set(videoGameDataset.children.map(item => item.name))];

                showTreemap()
            }

            catch (error){
                console.log(error);
            }
        }

        main();
    }, []);

    function kickstarterClicked(){
        showTreemap("kickstarter");
    }

    function movieClicked(){
        showTreemap("movie");
    }

    function videoGameClicked(){
        showTreemap("videoGame");
    }

    function showTreemap(type="kickstarter"){
        d3.select("#holder")
            .selectAll("*")
            .remove();
        d3.select("#legend")
            .selectAll("*")
            .remove();
            d3.select("#holder")
            .append("svg")
            .attr("id", "treemap")
            .attr("height", height)
            .attr("width", width);

        let dataset;
        let domain;
        let title;
        let description;

        switch(type){
            case "kickstarter":
                dataset = kickstarterDataset;
                domain = kickstarterDomain;
                title = "Kickstarter Pledges";
                description = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";
                break;

            case "movie":
                dataset = movieDataset;
                domain = movieDomain;
                title = "Movie Sales";
                description = "Top 100 Highest Grossing Movies Grouped By Genre";
                break;

            case "videoGame":
                dataset = videoGameDataset;
                domain = videoGameDomain;
                title = "Video Game Sales";
                description = "Top 100 Most Sold Video Games Grouped by Platform";
                break;

            default:
                dataset = kickstarterDataset;
                domain = kickstarterDomain;
                title = "Kickstarter Pledges";
                description = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";
        }

        document.getElementById("title").innerHTML = title;
        document.getElementById("description").innerHTML = description;

        var root = d3.hierarchy(dataset)
                        .sum((item) => item.value);
        d3.treemap()
            .size([width, height - 50])
            .padding(1)
            (root);

        const selectedColors = selectColors(domain.length);

        var colorScale = d3.scaleOrdinal()
                            .domain(domain)
                            .range(selectedColors);

        // from https://stackoverflow.com/questions/56623476/how-to-get-d3-treemap-cell-text-to-wrap-and-not-overflow-other-cells
        const cell = d3.select("svg")
                        .selectAll("g")
                        .data(root.leaves())
                        .enter()
                        .append("g")
                        .attr("transform", (item) => {
                            return `translate(${item.x0}, ${item.y0})`;
                        })

        cell.append("rect")
            .attr("width", (item) => item.x1 - item.x0)
            .attr("height", (item) => item.y1 - item.y0)
            .attr("class", "tile")
            .style("stroke", "black")
            .attr("data-name", (item) => {
                return item.data.name;
            })
            .attr("data-category", (item) => {
                return item.data.category;
            })
            .attr("data-value", (item) => {
                return item.data.value;
            })
            .style("fill", (item) => {
                return colorScale(item.data.category);
            })
            .on("mouseover", (event, item) => {
                d3.select(event.currentTarget)
                    .style("stroke", "white")
                    .style("opacity", 0.8);
                const tooltip = document.getElementById("tooltip");
                tooltip.style.visibility = "visible";
                tooltip.setAttribute("data-value", d3.select(event.currentTarget).attr("data-value"));
                const name = item.data.name;
                const category = item.data.category;
                const value = item.data.value;
                tooltip.innerHTML = `Name: ${name}<br />Category: ${category}<br />Value: ${value}`;
            })
            .on("mouseout", (event) => {
                document.getElementById("tooltip").style.visibility = "hidden";
                d3.select(event.currentTarget)
                    .style("stroke", "none")
                    .style("opacity", 1);
            });

        cell.append("text")
            .selectAll("tspan")
            .data((item) => {
                return item.data.name.split(/(?=[A-Z][^A-Z])/g);
            })
            .enter()
            .append("tspan")
            .attr("x", 4)
            .attr("y", (item, index) => 13 + 10 * index)
            .text((item) => item)
            .attr("font-size", "0.6em")
            .attr("fill", "black");

        const legendWidth = 700;
        const legendHeight = 150;

        d3.select("#legend")
            .append("svg")
            .attr("id", "legend-svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const legendDataset = [];

        for (let i = 0; i < selectedColors.length; i++) {
            legendDataset.push({
                name: domain[i],
                color: selectedColors[i]
            });
        }

        d3.select("#legend-svg")
            .selectAll("rect")
            .data(legendDataset)
            .enter()
            .append("rect")
            .attr("class", "legend-item")
            .attr("x", (item, index) => {
                return Math.floor(index / 6) * 180;
            })
            .attr("y", (item, index) => {
                return (index % 6) * 25;
            })
            .attr("height", 15)
            .attr("width", 15)
            .attr("fill", (item, index) => {
                return item.color;
            });

        d3.select("#legend-svg")
            .selectAll("text")
            .data(legendDataset)
            .enter()
            .append("text")
            .attr("x", (item, index) => {
                return (Math.floor(index / 6) * 180) + 20;
            })
            .attr("y", (item, index) => {
                return ((index % 6) * 25) + 15;
            })
            .text((item) => {
                return item.name;
            })
            .attr("fill", "white");
    }

    return (
        <div>
            <div class="row">
                <div class="col-sm-12 text-center">
                    <button id="kickstarter-button" onClick={kickstarterClicked}>Kickstarter Dataset</button>
                    <button id="movie-button" onClick={movieClicked}>Movie Dataset</button>
                    <button id="video-game-button" onClick={videoGameClicked}>Video Game Dataset</button>
                </div>
            </div>
            <h1 id="title">Kickstarter Pledges</h1>
            <h3 id="description">Top 100 Most Pledged Kickstarter Campaigns Grouped By Category</h3>
            <div id="holder"></div>
            <div id="container">
                <div id="tooltip-container">
                    <h3 id="tooltip">Placeholder text</h3>
                </div>
                <div id="legend-container">
                    <div id="legend"></div>
                </div>
            </div>
        </div>
    )
}

// from https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
function selectColors(number){
    const shuffled = colors.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, number);
}

export default TreemapDiagram;