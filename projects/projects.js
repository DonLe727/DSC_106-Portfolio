import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Fetch and render the initial projects
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

if (projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
}

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

// 2. Wrap ALL pie chart logic inside this single function
function renderPieChart(projectsGiven) {
    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,     
        (d) => d.year        
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Reset the selection whenever the chart is redrawn
    let selectedIndex = -1;

    arcs.forEach((arc, i) => {
        let path = svg.append('path')
           .attr('d', arc)
           .attr('fill', colors(i));
           
        legend.append('li')
              .attr('style', `--color: ${colors(i)}`)
              .html(`<span class="swatch"></span> ${data[i].label} <em>(${data[i].value})</em>`);

        // Attach the click listener INSIDE the render loop so new slices always get it
        path.on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;
            
            svg.selectAll('path')
               .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
            legend.selectAll('li')
               .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
            
            if (selectedIndex === -1) {
                renderProjects(projects, projectsContainer, 'h2');
            } else {
                let selectedYear = data[selectedIndex].label;
                let filteredProjects = projects.filter((project) => project.year === selectedYear);
                renderProjects(filteredProjects, projectsContainer, 'h2');
            }
        });
    });
}

// Call the function initially to draw the chart
renderPieChart(projects);

// 3. Search Bar Logic
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();
    
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Update both list and pie chart when searching
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});