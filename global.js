console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$('nav a');

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

currentLink?.classList.add('current');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/DonLe727', title: 'Github Profile' },
  { url: 'resume/', title: 'Resume' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

// FIX: Changed %20 to a hyphen (-) to match your GitHub repo URL
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "/" : "/DSC_106-Portfolio/";

for (let p of pages) {
  let url = p.url;
  
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${p.title}</a>`);
}

// Insert the theme switcher HTML into the body
document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `
);


let automaticOption = document.querySelector('#theme-switcher option[value="light dark"]');

let isDarkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;

// 3. Update the text content dynamically
if (isDarkOS) {
  automaticOption.textContent = 'Automatic (Dark)';
} else {
  automaticOption.textContent = 'Automatic (Light)';
}

// Grab the select element we just created
let select = document.querySelector('#theme-switcher');

// Listen for whenever the user changes the dropdown option
select.addEventListener('input', function (event) {
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  // Save the user's preference to localStorage
  localStorage.colorScheme = event.target.value; 
});

// Check if a preference was previously saved
if ("colorScheme" in localStorage) {
  // Apply the saved color scheme to the page
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  // Update the dropdown menu to match the saved preference
  select.value = localStorage.colorScheme;
}

// Grab the form element from the page
let form = document.querySelector('form');

// Use optional chaining (?.) so this doesn't throw an error on pages without a form
form?.addEventListener('submit', function (event) {
  // Prevent the browser from handling the form submission normally
  event.preventDefault();

  // Extract all the data the user typed into the form
  let data = new FormData(form);
  
  // Start building the URL using the action attribute (mailto:...)
  let url = form.action + "?";

  // Loop through each form field to encode the values
  let params = [];
  for (let [name, value] of data) {
    // encodeURIComponent converts spaces to %20 and handles other special characters
    params.push(name + '=' + encodeURIComponent(value));
  }

  // Join the parameters with '&' and append to the URL
  url += params.join('&');

  // Trigger the mail client with the properly formatted URL
  location.href = url;
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        // Parse the response into a format you can work with
        const data = await response.json();
        return data; 
        
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    // Clear existing content
    containerElement.innerHTML = '';

    for (let project of projects) {
        const article = document.createElement('article');
        
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
        `;
        
        containerElement.appendChild(article);
    }
}

export async function fetchGithubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}