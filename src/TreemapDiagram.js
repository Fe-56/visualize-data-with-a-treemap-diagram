import React, { useEffect } from 'react';
import * as d3 from 'd3';

const TreemapDiagram = (props) => {
    const height = 700;
    const width = 1200;
    const padding = 60;

    useEffect(() => {
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
        .then(res => res.json())
        .then((result) => {
            
        })
    }, []);

    return (
        <div id="holder"></div>
    )
}

export default TreemapDiagram;