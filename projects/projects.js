import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Fetch and render the projects
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

if (projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
}

// 2. Count and display the number of projects
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

// 3. Group the projects by year using d3.rollups
let rolledData = d3.rollups(
  projects,
  (v) => v.length,     // Count the number of projects
  (d) => d.year        // Group by the 'year' property
);

// 4. Map the grouped data into the format the pie chart expects
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

// 5. Setup D3 generators and color scale
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// 6. Select and clear the SVG and Legend (prevents duplicates)
let svg = d3.select('#projects-pie-plot');
svg.selectAll('path').remove();

let legend = d3.select('.legend');
legend.selectAll('li').remove();

// 7. Draw the colorful slices and legend items
arcs.forEach((arc, idx) => {
  // Add the pie slice
  svg.append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
    
  // Add the legend item
  legend.append('li')
    .attr('style', `--color: ${colors(idx)}`)
    .html(`<span class="swatch"></span> ${data[idx].label} <em>(${data[idx].value})</em>`);
});

// Step 4.4: Wrap the pie chart code in a function so it can be re-rendered
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

    arcs.forEach((arc, idx) => {
        svg.append('path')
           .attr('d', arc)
           .attr('fill', colors(idx));
           
        legend.append('li')
              .attr('style', `--color: ${colors(idx)}`)
              .html(`<span class="swatch"></span> ${data[idx].label} <em>(${data[idx].value})</em>`);
    });
}

// Call the function initially to draw the chart with all projects
renderPieChart(projects);

// Step 4.1 - 4.3: Add search functionality
let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    // Update query value and make case-insensitive
    query = event.target.value.toLowerCase();
    
    // Filter projects based on the query searching across all object values
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Re-render both the project list AND the pie chart with filtered data
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

let selectedIndex = -1;

arcs.forEach((arc, i) => {
    // Save the appended path to a variable
    let path = svg.append('path')
       .attr('d', arc)
       .attr('fill', colors(i));
       
    // ... (your existing legend append code) ...

    // Step 5.2: Toggle the selected state on click
    path.on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        
        svg.selectAll('path')
           .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
        legend.selectAll('li')
           .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

        if (selectedIndex === -1) {
            // If no slice is selected, clear the filter and show all projects
            renderProjects(projects, projectsContainer, 'h2');
        } else {
            // Find the year associated with the clicked slice
            let selectedYear = data[selectedIndex].label;
            
            // Filter the projects array to only include matching years
            let filteredProjects = projects.filter((project) => project.year === selectedYear);
            
            // Re-render the projects list with the filtered data
            renderProjects(filteredProjects, projectsContainer, 'h2');
        }
    });
});